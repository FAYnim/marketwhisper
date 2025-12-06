// ========================================
// AI Caption - Caption Generator
// ========================================

// Fungsi untuk initialize halaman caption
function initializeCaptionPage() {
    console.log('✍️ Initializing AI Caption page');
    
    // Setup form submit event
    const form = document.getElementById('captionForm');
    if (form) {
        form.addEventListener('submit', handleCaptionSubmit);
    }
    
    // Check if ada selected product
    loadSelectedProductForCaption();
}

// Handle form submit untuk generate caption
async function handleCaptionSubmit(event) {
    event.preventDefault();
    
    // Ambil form data
    const formData = {
        topic: document.getElementById('captionTopic').value,
        tone: document.getElementById('captionTone').value,
        length: document.getElementById('captionLength').value,
        cta: document.getElementById('captionCTA').value
    };
    
    // Validate required fields
    const validation = Utils.validateFormData(formData, ['topic', 'tone', 'length']);
    
    if (!validation.isValid) {
        Utils.showToast('❌ ' + validation.errors[0]);
        return;
    }
    
    // Generate caption
    try {
        await generateCaption(formData);
    } catch (error) {
        console.error('💥 Error in handleCaptionSubmit:', error);
        Utils.showToast('❌ Terjadi kesalahan: ' + error.message);
    }
}

// Fungsi utama untuk generate caption
async function generateCaption(formData) {
    console.log('🔄 Generating caption with data:', formData);
    
    // Show loading
    Utils.showButtonLoading('generateCaptionBtn', 'Generating...');
    Utils.showElement('loadingCaption');
    Utils.hideElement('captionResults');
    
    try {
        // Instruction file untuk caption
        const instructionFile = 'caption.md';
        console.log('📁 Instruction file:', instructionFile);
        
        // Create AI prompt
        const prompt = createCaptionPrompt(formData);
        console.log('💭 AI Prompt:', prompt);
        
        // Check if callAI is available
        if (typeof window.callAI !== 'function') {
            throw new Error('callAI function not available');
        }
        
        console.log('🤖 Calling AI...');
        // Call AI API
        const aiResponse = await window.callAI(prompt, instructionFile, 'caption');
        console.log('📨 AI Response:', aiResponse);
        
        // Parse and format AI response
        const captionData = parseAICaptionResponse(aiResponse, formData);
        console.log('🎯 Parsed caption:', captionData);
        
        // Display results
        displayCaption(captionData);
        
        console.log('✅ AI Caption generated successfully');
        
    } catch (error) {
        console.error('❌ Error generating caption:', error);
        Utils.showToast('❌ Gagal generate caption. Silakan coba lagi.');
        
        // Fallback to dummy data jika AI error
        const fallbackCaption = getDummyCaption(formData);
        displayCaption(fallbackCaption);
    } finally {
        // Hide loading
        Utils.hideButtonLoading('generateCaptionBtn', 'Generate Caption');
        Utils.hideElement('loadingCaption');
    }
}

// Fungsi untuk create prompt untuk AI
function createCaptionPrompt(formData) {
    const { topic, tone, length, cta } = formData;
    
    console.log('🔍 Checking getSelectedProduct availability:', typeof getSelectedProduct);
    const selectedProduct = getSelectedProduct();
    
    // Map tone ke format yang sesuai dengan instruction
    const toneMap = {
        'friendly': 'Ramah & Santai',
        'professional': 'Profesional',
        'enthusiastic': 'Antusias & Energik',
        'casual': 'Kasual & Menghibur'
    };
    
    // Map length ke jumlah kata
    const lengthMap = {
        'short': '75',
        'medium': '150',
        'long': '250'
    };
    
    const mappedTone = toneMap[tone] || 'Ramah & Santai';
    const mappedLength = lengthMap[length] || '150';
    
    let prompt = `Generate caption media sosial untuk UMKM dengan detail:

Tema/Topik: ${topic}
Tone: ${mappedTone}
Panjang Caption: ${mappedLength} kata
CTA: ${cta || 'buatkan CTA otomatis yang relevan'}`;

    // Tambahkan info produk jika ada
    if (selectedProduct) {
        prompt += `

Detail Produk:
- Nama Produk: ${selectedProduct.name}
- Kategori: ${selectedProduct.category}
- Deskripsi: ${selectedProduct.description}
- Harga: Rp ${selectedProduct.price.toLocaleString('id-ID')}`;
    }

    prompt += `

Berikan caption yang menarik dan siap pakai untuk media sosial.`;
    
    return prompt;
}

// Fungsi untuk parse AI response
function parseAICaptionResponse(aiResponse, formData) {
    try {
        // Coba parse sebagai JSON dulu
        let parsedResponse;
        if (typeof aiResponse === 'string') {
            // Bersihkan markdown code blocks jika ada
            const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            parsedResponse = JSON.parse(cleanedResponse);
        } else {
            parsedResponse = aiResponse;
        }
        
        // Extract caption dari response
        const captionText = parsedResponse.caption || parsedResponse.text || '';
        
        // Generate hashtags dan CTA dari caption atau buat default
        const hashtags = extractHashtags(captionText) || generateTopicHashtags(formData.topic);
        const cta = formData.cta || extractCTA(captionText) || generateDefaultCTA(formData.topic);
        
        // Bersihkan caption dari hashtags yang sudah di-extract
        const cleanCaption = captionText.replace(/#\w+/g, '').trim();
        
        return {
            caption: cleanCaption,
            hashtags: hashtags,
            cta: cta
        };
        
    } catch (error) {
        console.error('Error parsing AI response:', error);
        // Fallback: gunakan response sebagai caption langsung
        return parseTextCaptionResponse(aiResponse, formData);
    }
}

// Fungsi untuk parse text response sebagai fallback
function parseTextCaptionResponse(textResponse, formData) {
    const hashtags = extractHashtags(textResponse) || generateTopicHashtags(formData.topic);
    const cta = formData.cta || extractCTA(textResponse) || generateDefaultCTA(formData.topic);
    
    // Bersihkan caption dari hashtags
    const cleanCaption = textResponse.replace(/#\w+/g, '').trim();
    
    return {
        caption: cleanCaption || getDummyCaption(formData).caption,
        hashtags: hashtags,
        cta: cta
    };
}

// Fungsi untuk extract hashtags dari text
function extractHashtags(text) {
    const hashtagRegex = /#\w+/g;
    const matches = text.match(hashtagRegex);
    
    if (matches && matches.length > 0) {
        return matches.slice(0, 8); // Maksimal 8 hashtags
    }
    
    return null;
}

// Fungsi untuk extract CTA dari text
function extractCTA(text) {
    // Cari pola CTA di akhir caption
    const ctaPatterns = [
        /(?:hubungi|dm|chat|pesan|order|kunjungi|follow|share|tag|comment|like|save)[^.!?]*[.!?]/gi,
        /💬[^.!?\n]+/g,
        /📞[^.!?\n]+/g,
        /🛒[^.!?\n]+/g
    ];
    
    for (const pattern of ctaPatterns) {
        const match = text.match(pattern);
        if (match && match.length > 0) {
            return match[match.length - 1].trim();
        }
    }
    
    return null;
}

// Fungsi untuk display caption results
function displayCaption(captionData) {
    const resultsContainer = document.getElementById('captionResults');
    
    if (!resultsContainer) {
        console.error('Caption results container not found');
        return;
    }
    
    // Update caption text
    const captionText = document.getElementById('captionText');
    if (captionText) {
        captionText.textContent = captionData.caption;
    }
    
    // Update hashtags
    const hashtagsEl = document.getElementById('captionHashtags');
    if (hashtagsEl) {
        hashtagsEl.textContent = captionData.hashtags.join(' ');
    }
    
    // Update CTA
    const ctaEl = document.getElementById('captionCTAText');
    if (ctaEl) {
        ctaEl.textContent = captionData.cta;
    }
    
    // Show results dengan fade-in
    Utils.showElement('captionResults');
    Utils.scrollToElement('captionResults', 100);
    
    console.log('✅ Caption displayed successfully');
}

// Dummy data untuk testing caption
function getDummyCaption(formData) {
    const { topic, tone, length, cta } = formData;
    
    // Base caption berdasarkan tone
    const toneStyles = {
        friendly: {
            intro: "Halo teman-teman! 👋",
            style: "ramah dan akrab",
            emoji: "😊✨🎉"
        },
        professional: {
            intro: "Selamat pagi,",
            style: "formal dan informatif",
            emoji: "📋💼🏆"
        },
        enthusiastic: {
            intro: "Wohoo! 🎉",
            style: "penuh semangat",
            emoji: "🔥💪⚡"
        },
        casual: {
            intro: "Hey guys!",
            style: "santai dan fun",
            emoji: "😄🤙🎈"
        }
    };
    
    const selectedTone = toneStyles[tone] || toneStyles.friendly;
    
    // Generate caption berdasarkan panjang
    let captionText = '';
    
    if (length === 'short') {
        captionText = `${selectedTone.intro}\n\n${topic} nih! Gimana menurut kalian? ${selectedTone.emoji.charAt(0)}\n\nYuk share pengalaman kalian di komen! 👇`;
    } else if (length === 'medium') {
        captionText = `${selectedTone.intro}\n\nHari ini mau sharing tentang ${topic}. Sebagai pelaku UMKM, aku selalu berusaha memberikan yang terbaik untuk kalian semua.\n\n${topic} ini special banget karena dibuat dengan penuh perhatian dan kualitas terjaga. Kalian pasti suka deh! ${selectedTone.emoji.charAt(1)}\n\nAda yang penasaran? Drop pertanyaan di komen ya! 💬`;
    } else { // long
        captionText = `${selectedTone.intro}\n\nMau cerita nih tentang ${topic}. Jadi, journey UMKM ini gak pernah mudah, tapi setiap hari selalu ada pembelajaran baru.\n\n${topic} yang aku tawarkan ini hasil dari riset dan trial error yang panjang. Aku pengen banget kalian merasakan kualitas terbaik dari usaha kecil seperti aku ini.\n\nKenapa harus pilih produk UMKM? Karena di setiap pembelian kalian, ada cerita, ada perjuangan, dan ada mimpi yang kalian dukung. ${selectedTone.emoji}\n\nTerima kasih buat yang udah support dari awal. Kalian luar biasa! 🙏\n\nYang belum coba, buruan sebelum kehabisan ya! ⏰`;
    }
    
    // Generate hashtags
    const baseHashtags = ['#umkm', '#usahalokalis', '#supportlokal', '#umkmindonesia'];
    const topicHashtags = generateTopicHashtags(topic);
    const allHashtags = [...baseHashtags, ...topicHashtags];
    
    // Generate atau gunakan CTA yang disediakan
    const finalCTA = cta || generateDefaultCTA(topic);
    
    return {
        caption: captionText,
        hashtags: allHashtags.slice(0, 8), // Maksimal 8 hashtags
        cta: finalCTA
    };
}

// Fungsi untuk generate hashtags berdasarkan topik
function generateTopicHashtags(topic) {
    const hashtags = [];
    
    // Keywords umum untuk makanan
    if (topic.toLowerCase().includes('makanan') || topic.toLowerCase().includes('makan') || topic.toLowerCase().includes('kuliner')) {
        hashtags.push('#kuliner', '#makananhalal', '#foodie', '#jajan');
    }
    
    // Keywords untuk fashion
    if (topic.toLowerCase().includes('fashion') || topic.toLowerCase().includes('baju') || topic.toLowerCase().includes('style')) {
        hashtags.push('#fashion', '#ootd', '#style', '#bajumurah');
    }
    
    // Keywords untuk promo/sale
    if (topic.toLowerCase().includes('promo') || topic.toLowerCase().includes('diskon') || topic.toLowerCase().includes('sale')) {
        hashtags.push('#promo', '#diskon', '#sale', '#murahmeriah');
    }
    
    // Default hashtags
    if (hashtags.length === 0) {
        hashtags.push('#produklokal', '#kualitasterjamin', '#trusted', '#recommended');
    }
    
    return hashtags;
}

// Fungsi untuk generate default CTA
function generateDefaultCTA(topic) {
    const ctas = [
        "💬 DM untuk info lebih lanjut!",
        "📞 Hubungi kami: 081234567890",
        "🛒 Pesan sekarang sebelum kehabisan!",
        "💌 Chat WA untuk fast respon!",
        "🏪 Kunjungi toko kami atau order online!"
    ];
    
    // Random CTA
    return ctas[Math.floor(Math.random() * ctas.length)];
}

// Fungsi untuk load selected product untuk caption
function loadSelectedProductForCaption() {
    const selectedProduct = getSelectedProduct();
    
    if (selectedProduct) {
        console.log('✅ Selected product found:', selectedProduct);
        
        // Pre-fill topic dengan nama produk
        const topicInput = document.getElementById('captionTopic');
        if (topicInput && !topicInput.value) {
            topicInput.value = selectedProduct.name;
        }
    }
}

// Fungsi untuk clear selected product
function clearSelectedProductForCaption() {
    clearSelectedProduct();
    
    // Clear topic input jika isinya adalah nama produk
    const topicInput = document.getElementById('captionTopic');
    if (topicInput) {
        topicInput.value = '';
    }
    
    // Reload page untuk refresh
    location.reload();
}

// Export functions untuk global access
window.initializeCaptionPage = initializeCaptionPage;
window.clearSelectedProductForCaption = clearSelectedProductForCaption;