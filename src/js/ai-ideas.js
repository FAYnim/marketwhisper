// ========================================
// AI Ideas - Ide Konten Generator
// ========================================

// Fungsi untuk initialize halaman ideas
function initializeIdeasPage() {
    console.log('💡 Initializing AI Ideas page');
    
    // Setup form submit event
    const form = document.getElementById('ideasForm');
    if (form) {
        console.log('✅ Form found, adding event listener');
        form.addEventListener('submit', handleIdeasSubmit);
    } else {
        console.error('❌ Form not found!');
    }
    
    // Check if callAI is available
    console.log('🔍 Checking callAI availability:', typeof window.callAI);
}

// Handle form submit untuk generate ideas
async function handleIdeasSubmit(event) {
    event.preventDefault();
    console.log('🚀 Form submitted, preventing default');
    
    // Ambil form data
    const formData = {
        businessType: document.getElementById('businessType').value,
        contentGoal: document.getElementById('contentGoal').value,
        platform: document.getElementById('platform').value
    };
    
    console.log('📝 Form data collected:', formData);
    
    // Validate form
    const validation = Utils.validateFormData ? Utils.validateFormData(formData, ['businessType', 'contentGoal', 'platform']) : { isValid: true };
    
    if (!validation.isValid) {
        Utils.showToast('❌ ' + validation.errors[0]);
        return;
    }
    
    console.log('✅ Form validation passed');
    
    // Generate ideas
    try {
        await generateIdeas(formData);
    } catch (error) {
        console.error('💥 Error in handleIdeasSubmit:', error);
        alert('Terjadi kesalahan: ' + error.message);
    }
}

// Fungsi utama untuk generate ideas
async function generateIdeas(formData) {
    console.log('🔄 Generating ideas with data:', formData);
    
    // Show loading
    Utils.showButtonLoading('generateBtn', 'Generating...');
    Utils.showElement('loadingIdeas');
    Utils.hideElement('ideasResults');
    
    try {
        // Map content goal to instruction file
        const instructionFile = getInstructionFile(formData.contentGoal);
        console.log('📁 Instruction file:', instructionFile);
        
        // Create AI prompt
        const prompt = createIdeasPrompt(formData);
        console.log('💭 AI Prompt:', prompt);
        
        // Check if callAI is available
        if (typeof window.callAI !== 'function') {
            console.error('❌ callAI function not available');
            throw new Error('AI function not available');
        }
        
        console.log('🤖 Calling AI...');
        // Call AI API
        const aiResponse = await window.callAI(prompt, instructionFile, formData.contentGoal);
        console.log('📨 AI Response:', aiResponse);
        
        // Parse and format AI response
        const ideas = parseAIResponse(aiResponse, formData);
        console.log('🎯 Parsed ideas:', ideas);
        
        // Display results
        displayIdeas(ideas);
        
        console.log('✅ AI Ideas generated successfully');
        
    } catch (error) {
        console.error('❌ Error generating ideas:', error);
        Utils.showToast('❌ Gagal generate ide konten. Silakan coba lagi.');
        
        // Fallback to dummy data jika AI error
        const fallbackIdeas = getDummyIdeas(formData);
        displayIdeas(fallbackIdeas);
    } finally {
        // Hide loading
        Utils.hideButtonLoading('generateBtn', 'Generate Ide Konten');
        Utils.hideElement('loadingIdeas');
    }
}

// Fungsi untuk mapping content goal ke instruction file
function getInstructionFile(contentGoal) {
    const instructionMap = {
        'jualan': 'promosi-jualan-harian.md',
        'brand_awareness': 'brand-awareness.md', 
        'edukasi': 'edukasi.md',
        'testimoni': 'review.md',
        'behind_scene': 'bts.md'
    };
    
    return instructionMap[contentGoal] || 'promosi-jualan-harian.md';
}

// Fungsi untuk create prompt untuk AI
function createIdeasPrompt(formData) {
    const { businessType, contentGoal, platform } = formData;
    
    return `Generate ide konten untuk UMKM dengan detail:

Jenis Usaha: ${businessType}
Tujuan Konten: ${contentGoal}
Platform: ${platform}

Berikan 3-4 ide konten yang kreatif, praktis, dan mudah dieksekusi untuk UMKM.`;
}

// Fungsi untuk parse AI response
function parseAIResponse(aiResponse, formData) {
    try {
        // Coba parse sebagai JSON dulu
        let parsedResponse;
        if (typeof aiResponse === 'string') {
            // Cari JSON dalam response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedResponse = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } else {
            parsedResponse = aiResponse;
        }
        
        // Convert AI response format to our format
        if (parsedResponse.ide_konten && Array.isArray(parsedResponse.ide_konten)) {
            return parsedResponse.ide_konten.map((item, index) => ({
                title: item.hook || `Ide Konten ${index + 1}`,
                description: `${item.format}\n\n${item.visual}\n\nCTA: ${item.cta}`,
                platform: formData.platform,
                format: item.format || 'Social Media Post',
                confidence: 0.85 + (Math.random() * 0.1) // Random confidence 0.85-0.95
            }));
        } else {
            throw new Error('Invalid AI response format');
        }
        
    } catch (error) {
        console.error('Error parsing AI response:', error);
        
        // Fallback: parse as plain text
        return parseTextResponse(aiResponse, formData);
    }
}

// Fungsi untuk parse text response sebagai fallback
function parseTextResponse(textResponse, formData) {
    // Split response menjadi ide-ide individual
    const ideas = [];
    const lines = textResponse.split('\n').filter(line => line.trim());
    
    let currentIdea = null;
    
    lines.forEach(line => {
        line = line.trim();
        
        // Deteksi awal ide baru (biasanya berisi angka atau bullet)
        if (line.match(/^\d+\./) || line.match(/^[•-]/) || line.toLowerCase().includes('ide')) {
            if (currentIdea) {
                ideas.push(currentIdea);
            }
            
            currentIdea = {
                title: line.replace(/^\d+\.\s*/, '').replace(/^[•-]\s*/, ''),
                description: '',
                platform: formData.platform,
                format: 'Social Media Content',
                confidence: 0.80 + (Math.random() * 0.15)
            };
        } else if (currentIdea && line.length > 0) {
            // Tambah ke deskripsi ide saat ini
            currentIdea.description += (currentIdea.description ? '\n' : '') + line;
        }
    });
    
    // Tambah ide terakhir
    if (currentIdea) {
        ideas.push(currentIdea);
    }
    
    // Jika tidak ada ide yang ter-parse, buat default
    if (ideas.length === 0) {
        ideas.push({
            title: 'Konten AI Generated',
            description: textResponse.substring(0, 200) + '...',
            platform: formData.platform,
            format: 'AI Content',
            confidence: 0.75
        });
    }
    
    return ideas.slice(0, 4); // Maksimal 4 ide
}

// Fungsi untuk display ideas results
function displayIdeas(ideas) {
    const resultsContainer = document.getElementById('ideasResults');
    const ideasList = document.getElementById('ideasList');
    
    if (!resultsContainer || !ideasList) {
        console.error('Results container not found');
        return;
    }
    
    // Clear previous results
    ideasList.innerHTML = '';
    
    // Generate HTML untuk setiap idea
    ideas.forEach((idea, index) => {
        const ideaCard = createIdeaCard(idea, index);
        ideasList.appendChild(ideaCard);
    });
    
    // Show results dengan fade-in
    Utils.showElement('ideasResults');
    Utils.scrollToElement('ideasResults', 100);
    
    console.log(`✅ Displayed ${ideas.length} ideas`);
}

// Fungsi untuk create idea card element
function createIdeaCard(idea, index) {
    const card = document.createElement('div');
    card.className = 'idea-card';
    card.setAttribute('data-index', index);
    
    card.innerHTML = `
        <div class="idea-title">${idea.title}</div>
        <div class="idea-description">${idea.description}</div>
        <div class="idea-meta">
            <span class="meta-item">📱 ${idea.platform}</span>
            <span class="meta-item">🎯 ${idea.format}</span>
            <span class="meta-item">📊 ${Math.round(idea.confidence * 100)}%</span>
        </div>
        <button class="btn btn-copy" onclick="copyIdea(${index})">
            📋 Copy Ide Ini
        </button>
    `;
    
    return card;
}

// Fungsi untuk copy idea
function copyIdea(index) {
    const ideas = window.currentIdeas || [];
    const idea = ideas[index];
    
    if (!idea) {
        Utils.showToast('❌ Ide tidak ditemukan');
        return;
    }
    
    // Format idea untuk copy
    const ideaText = `💡 ${idea.title}

${idea.description}

📱 Platform: ${idea.platform}
🎯 Format: ${idea.format}
📊 Confidence: ${Math.round(idea.confidence * 100)}%

--- Generated by AI UMKM ---`;
    
    // Copy ke clipboard
    copyTextToClipboard(ideaText);
}

// Fungsi untuk copy text langsung
function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            Utils.showToast('✅ Ide berhasil disalin ke clipboard!');
        }).catch(err => {
            console.error('Copy failed:', err);
            Utils.showToast('❌ Gagal menyalin ide');
        });
    } else {
        // Fallback untuk browser lama
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            Utils.showToast('✅ Ide berhasil disalin ke clipboard!');
        } catch (err) {
            Utils.showToast('❌ Gagal menyalin ide');
        }
        
        document.body.removeChild(textArea);
    }
}

// Dummy data untuk testing (akan diganti dengan real API)
function getDummyIdeas(formData) {
    const { businessType, contentGoal, platform } = formData;
    
    // Sample ideas berdasarkan input
    const baseIdeas = {
        makanan: {
            jualan: [
                {
                    title: "Behind The Scene Masak",
                    description: "Tunjukkan proses pembuatan makanan dari awal sampai jadi. Bikin video 15-30 detik dengan ASMR suara masakan.",
                    platform: platform,
                    format: platform === 'TikTok' ? 'Video Pendek' : 'Reels',
                    confidence: 0.89
                },
                {
                    title: "Review Pelanggan Real Time",
                    description: "Posting foto makanan yang lagi dimakan pelanggan + caption testimoninya. Authentic dan build trust.",
                    platform: platform,
                    format: platform === 'Instagram' ? 'Feed Post' : 'Story',
                    confidence: 0.85
                },
                {
                    title: "Menu Harian + Harga",
                    description: "Bikin carousel atau slide menu hari ini lengkap dengan harga. Tambah 'Pesan sekarang sebelum kehabisan'.",
                    platform: platform,
                    format: 'Carousel',
                    confidence: 0.92
                }
            ],
            brand_awareness: [
                {
                    title: "Cerita Awal Usaha",
                    description: "Share story kenapa mulai usaha makanan ini. Personal touch yang bikin orang relate dan ingat brand.",
                    platform: platform,
                    format: 'Story Series',
                    confidence: 0.87
                },
                {
                    title: "Tips Masak Simple",
                    description: "Kasih tips masak sederhana yang relate dengan produk. Positioning sebagai ahli di bidang kuliner.",
                    platform: platform,
                    format: 'Educational Post',
                    confidence: 0.83
                },
                {
                    title: "Bahan Berkualitas",
                    description: "Showcase bahan-bahan segar yang dipakai. Highlight commitment terhadap kualitas dan kesehatan.",
                    platform: platform,
                    format: 'Video/Photo',
                    confidence: 0.88
                }
            ]
        },
        fashion: {
            jualan: [
                {
                    title: "OOTD dengan Produk",
                    description: "Bikin OOTD pakai produk yang dijual. Show different styling untuk satu item. Relatable dan inspiring.",
                    platform: platform,
                    format: 'Reels/Video',
                    confidence: 0.91
                },
                {
                    title: "Before After Styling",
                    description: "Tunjukkan transformasi outfit dari basic ke stylish pakai produk. Highlight versatility produk.",
                    platform: platform,
                    format: 'Transition Video',
                    confidence: 0.86
                },
                {
                    title: "Flash Sale Countdown",
                    description: "Bikin urgency dengan countdown timer untuk flash sale. Tampilkan best seller items dengan discount.",
                    platform: platform,
                    format: 'Story/Post',
                    confidence: 0.89
                }
            ]
        }
    };
    
    // Ambil ideas sesuai kategori, fallback ke ideas umum
    const categoryIdeas = baseIdeas[businessType] && baseIdeas[businessType][contentGoal] 
        ? baseIdeas[businessType][contentGoal]
        : [
            {
                title: "Konten Engaging Harian",
                description: `Buat konten ${contentGoal} yang sesuai dengan ${businessType} Anda. Fokus pada value dan engagement pelanggan.`,
                platform: platform,
                format: 'Multi Format',
                confidence: 0.75
            },
            {
                title: "User Generated Content",
                description: "Ajak pelanggan untuk share experience mereka. Repost dengan credit untuk build community.",
                platform: platform,
                format: 'UGC',
                confidence: 0.82
            },
            {
                title: "Educational Content",
                description: "Share knowledge atau tips yang relate dengan industri Anda. Build authority dan trust.",
                platform: platform,
                format: 'Educational',
                confidence: 0.79
            }
        ];
    
    // Simpan ke global variable untuk copy function
    window.currentIdeas = categoryIdeas;
    
    return categoryIdeas;
}

// Export functions untuk global access
window.initializeIdeasPage = initializeIdeasPage;
window.copyIdea = copyIdea;