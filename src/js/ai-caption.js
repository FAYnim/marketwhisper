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
function handleCaptionSubmit(event) {
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
    generateCaption(formData);
}

// Fungsi utama untuk generate caption
function generateCaption(formData) {
    console.log('🔄 Generating caption with data:', formData);
    
    // Show loading
    Utils.showButtonLoading('generateCaptionBtn', 'Generating...');
    Utils.showElement('loadingCaption');
    Utils.hideElement('captionResults');
    
    // Simulasi API call (akan diganti dengan real API)
    setTimeout(() => {
        const captionData = getDummyCaption(formData);
        displayCaption(captionData);
        
        // Hide loading
        Utils.hideButtonLoading('generateCaptionBtn', 'Generate Caption');
        Utils.hideElement('loadingCaption');
    }, 2500);
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

// Fungsi untuk load selected product dari localStorage
function loadSelectedProductForCaption() {
    const product = getSelectedProduct();
    
    if (product) {
        // Show product selection card
        const selectionDiv = document.getElementById('product-selection');
        const productNameSpan = document.getElementById('selected-product-name');
        const topicInput = document.getElementById('captionTopic');
        
        if (selectionDiv && productNameSpan && topicInput) {
            selectionDiv.classList.remove('hidden');
            productNameSpan.textContent = product.name;
            
            // Auto-fill topic with product info
            topicInput.value = `Promo ${product.name} - ${product.description.substring(0, 50)}...`;
        }
    }
}

// Fungsi untuk clear selected product
function clearSelectedProductForCaption() {
    clearSelectedProduct();
    
    // Hide product selection card
    const selectionDiv = document.getElementById('product-selection');
    const topicInput = document.getElementById('captionTopic');
    
    if (selectionDiv) {
        selectionDiv.classList.add('hidden');
    }
    
    if (topicInput) {
        topicInput.value = '';
    }
    
    showToast('Produk dihapus dari caption', 'success');
}

// Export functions untuk global access
window.initializeCaptionPage = initializeCaptionPage;
window.clearSelectedProductForCaption = clearSelectedProductForCaption;