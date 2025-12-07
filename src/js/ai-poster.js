function initializePosterPage() {
    console.log('🎨 Initializing AI Poster page');
    
    // Setup form submit event
    const form = document.getElementById('posterForm');
    if (form) {
        form.addEventListener('submit', handlePosterSubmit);
    }
}

// Handle form submit untuk generate poster
function handlePosterSubmit(event) {
    event.preventDefault();
    
    // Ambil form data
    const formData = {
        title: document.getElementById('posterTitle').value,
        description: document.getElementById('posterDescription').value,
        promoType: document.getElementById('promoType').value,
        cta: document.getElementById('posterCTA').value
    };
    
    // Validate required fields
    const validation = Utils.validateFormData(formData, ['title', 'description', 'promoType', 'cta']);
    
    if (!validation.isValid) {
        Utils.showToast('❌ ' + validation.errors[0]);
        return;
    }
    
    // Generate poster
    generatePoster(formData);
}

// Fungsi utama untuk generate poster
function generatePoster(formData) {
    console.log('🔄 Generating poster with data:', formData);
    
    // Show loading
    Utils.showButtonLoading('generatePosterBtn', 'Generating...');
    Utils.showElement('loadingPoster');
    Utils.hideElement('posterResults');
    
    // Simulasi API call (akan diganti dengan real API)
    setTimeout(() => {
        const posterData = getDummyPoster(formData);
        displayPoster(posterData);
        
        // Hide loading
        Utils.hideButtonLoading('generatePosterBtn', 'Generate Layout Poster');
        Utils.hideElement('loadingPoster');
    }, 3000);
}

// Fungsi untuk display poster results
function displayPoster(posterData) {
    const resultsContainer = document.getElementById('posterResults');
    
    if (!resultsContainer) {
        console.error('Poster results container not found');
        return;
    }
    
    // Update layout
    const layoutEl = document.getElementById('posterLayout');
    if (layoutEl) {
        layoutEl.textContent = posterData.layout;
    }
    
    // Update color palette
    const colorEl = document.getElementById('colorPalette');
    if (colorEl) {
        const colorHTML = posterData.colorPalette.map(color => 
            `<div style="display: inline-block; width: 30px; height: 30px; background: ${color}; margin-right: 10px; border-radius: 50%; border: 2px solid #ddd;"></div>
            <span>${color}</span>`
        ).join('\n\n');
        colorEl.innerHTML = colorHTML;
    }
    
    // Update font suggestion
    const fontEl = document.getElementById('fontSuggestion');
    if (fontEl) {
        fontEl.textContent = posterData.fontSuggestion;
    }
    
    // Show results dengan fade-in
    Utils.showElement('posterResults');
    Utils.scrollToElement('posterResults', 100);
    
    console.log('✅ Poster layout displayed successfully');
}

// Dummy data untuk testing poster
function getDummyPoster(formData) {
    const { title, description, promoType, cta } = formData;
    
    // Generate layout berdasarkan jenis promo
    const layouts = {
        diskon: generateDiscountLayout(title, description, cta),
        produk_baru: generateNewProductLayout(title, description, cta),
        event: generateEventLayout(title, description, cta),
        info_umum: generateInfoLayout(title, description, cta),
        testimoni: generateTestimoniLayout(title, description, cta)
    };
    
    const layout = layouts[promoType] || layouts.info_umum;
    
    // Color palettes berdasarkan jenis promo
    const colorSchemes = {
        diskon: ['#FF4444', '#FFFFFF', '#000000'], // Merah, putih, hitam
        produk_baru: ['#00D4AA', '#FFFFFF', '#2D3748'], // Hijau, putih, abu gelap
        event: ['#9F7AEA', '#FFFFFF', '#1A202C'], // Ungu, putih, hitam
        info_umum: ['#3182CE', '#FFFFFF', '#2D3748'], // Biru, putih, abu
        testimoni: ['#F6AD55', '#FFFFFF', '#1A202C'] // Orange, putih, hitam
    };
    
    // Font suggestions berdasarkan tone
    const fonts = {
        diskon: 'Montserrat Black (Judul) + Open Sans (Body)',
        produk_baru: 'Poppins Bold (Judul) + Inter Regular (Body)',
        event: 'Playfair Display (Judul) + Source Sans Pro (Body)',
        info_umum: 'Roboto Bold (Judul) + Roboto Regular (Body)',
        testimoni: 'Lora Bold (Judul) + PT Sans (Body)'
    };
    
    return {
        layout: layout,
        colorPalette: colorSchemes[promoType] || colorSchemes.info_umum,
        fontSuggestion: fonts[promoType] || fonts.info_umum
    };
}

// Layout generators untuk berbagai jenis promo
function generateDiscountLayout(title, description, cta) {
    return `🔥 ${title.toUpperCase()} 🔥
(Font: 36pt, Bold, Warna Merah)

${description}
(Font: 16pt, Regular, Warna Hitam)

⏰ TERBATAS!
(Font: 20pt, Bold, Warna Merah)

${cta}
(Font: 18pt, Bold, Background Merah, Text Putih)

--- CARA PAKAI ---
1. Buka Canva atau app desain lainnya
2. Buat poster ukuran 1080x1080px
3. Copy text di atas sesuai ukuran font
4. Gunakan warna yang disarankan
5. Tambah background menarik`;
}

function generateNewProductLayout(title, description, cta) {
    return `✨ ${title} ✨
(Font: 32pt, Bold, Warna Hijau)

NEW ARRIVAL!
(Font: 24pt, Bold, Warna Hijau)

${description}
(Font: 16pt, Regular, Warna Abu Gelap)

${cta}
(Font: 18pt, Bold, Background Hijau, Text Putih)

--- TIPS DESAIN ---
• Gunakan background putih/terang
• Tambah foto produk di tengah
• Beri space yang cukup antar text
• Highlight kata 'NEW' dengan warna kontras`;
}

function generateEventLayout(title, description, cta) {
    return `🎉 ${title} 🎉
(Font: 34pt, Bold, Warna Ungu)

${description}
(Font: 16pt, Regular, Warna Hitam)

📅 JANGAN SAMPAI TERLEWAT!
(Font: 18pt, Bold, Warna Ungu)

${cta}
(Font: 18pt, Bold, Background Ungu, Text Putih)

--- ELEMENT TAMBAHAN ---
• Tambah border/frame dekoratif
• Gunakan icon kalender atau jam
• Beri efek shadow pada text utama
• Background gradient ungu-putih`;
}

function generateInfoLayout(title, description, cta) {
    return `📢 ${title}
(Font: 30pt, Bold, Warna Biru)

${description}
(Font: 16pt, Regular, Warna Abu Gelap)

INFO LEBIH LANJUT:
(Font: 14pt, Bold, Warna Biru)

${cta}
(Font: 16pt, Regular, Background Biru, Text Putih)

--- LAYOUT TIPS ---
• Layout clean dan mudah dibaca
• Gunakan bullet points jika perlu
• Beri padding yang cukup
• Font yang professional dan clear`;
}

function generateTestimoniLayout(title, description, cta) {
    return `"${title}"
(Font: 28pt, Italic, Warna Orange)

${description}
(Font: 16pt, Regular, Warna Hitam)

⭐⭐⭐⭐⭐
(Font: 24pt)

${cta}
(Font: 16pt, Bold, Background Orange, Text Putih)

--- TESTIMONIAL DESIGN ---
• Gunakan tanda kutip besar
• Tambah foto customer (blur jika perlu)
• Beri rating bintang yang jelas
• Background warm colors (krem/orange muda)`;
}

// Export functions untuk global access
window.initializePosterPage = initializePosterPage;