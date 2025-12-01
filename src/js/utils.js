// ========================================
// Utils.js - Helper Functions
// ========================================

// Fungsi untuk copy text ke clipboard
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    
    if (!element) {
        console.error('Element not found:', elementId);
        return;
    }
    
    // Ambil text content dari element
    const text = element.textContent || element.innerText;
    
    // Copy menggunakan Clipboard API (modern browsers)
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('✅ Berhasil disalin ke clipboard!');
            console.log('📋 Text copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            fallbackCopyText(text);
        });
    } else {
        // Fallback untuk browser lama
        fallbackCopyText(text);
    }
}

// Fallback copy method untuk browser lama
function fallbackCopyText(text) {
    // Buat temporary textarea
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Add ke DOM sementara
    document.body.appendChild(textArea);
    
    // Select dan copy
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast('✅ Berhasil disalin ke clipboard!');
            console.log('📋 Text copied using fallback method');
        } else {
            showToast('❌ Gagal menyalin text');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showToast('❌ Gagal menyalin text');
    }
    
    // Remove temporary element
    document.body.removeChild(textArea);
}

// Fungsi untuk show toast notification
function showToast(message, duration = 3000) {
    // Ambil atau buat toast element
    let toast = document.getElementById('toast');
    if (!toast) {
        // Buat toast jika belum ada
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast hidden';
        toast.innerHTML = '<p id="toast-message"></p>';
        document.body.appendChild(toast);
    }
    
    // Update message
    const messageEl = document.getElementById('toast-message');
    messageEl.textContent = message;
    
    // Show toast
    toast.classList.remove('hidden');
    
    // Hide toast after duration
    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
    
    console.log('🔔 Toast shown:', message);
}

// Fungsi untuk show loading pada button
function showButtonLoading(buttonId, loadingText = 'Loading...') {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    // Simpan text asli
    const originalText = button.querySelector('.btn-text');
    if (originalText) {
        originalText.textContent = loadingText;
    }
    
    // Show spinner
    const spinner = button.querySelector('.btn-spinner');
    if (spinner) {
        spinner.classList.remove('hidden');
    }
    
    // Disable button
    button.disabled = true;
    button.style.opacity = '0.7';
}

// Fungsi untuk hide loading pada button
function hideButtonLoading(buttonId, originalText = 'Generate') {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    // Restore text asli
    const textEl = button.querySelector('.btn-text');
    if (textEl) {
        textEl.textContent = originalText;
    }
    
    // Hide spinner
    const spinner = button.querySelector('.btn-spinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
    
    // Enable button
    button.disabled = false;
    button.style.opacity = '1';
}

// Fungsi untuk show/hide element dengan class
function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('hidden');
        element.classList.add('fade-in');
    }
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
        element.classList.remove('fade-in');
    }
}

// Fungsi untuk validate form input
function validateFormData(formData, requiredFields) {
    const errors = [];
    
    requiredFields.forEach(field => {
        if (!formData[field] || formData[field].trim() === '') {
            errors.push(`${field} harus diisi`);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Fungsi untuk format text dengan line breaks
function formatTextWithBreaks(text) {
    return text.replace(/\n/g, '<br>');
}

// Fungsi untuk scroll ke element
function scrollToElement(elementId, offset = 0) {
    const element = document.getElementById(elementId);
    if (element) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
}

// Fungsi untuk debounce (mencegah multiple calls terlalu cepat)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Fungsi untuk safe JSON parse
function safeJsonParse(jsonString, fallback = null) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('JSON Parse Error:', error);
        return fallback;
    }
}

// Fungsi untuk format number dengan separator
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Fungsi untuk generate random ID
function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

// Export functions ke global scope agar bisa dipakai di file lain
window.Utils = {
    copyToClipboard,
    showToast,
    showButtonLoading,
    hideButtonLoading,
    showElement,
    hideElement,
    validateFormData,
    formatTextWithBreaks,
    scrollToElement,
    debounce,
    safeJsonParse,
    formatNumber,
    generateId
};

// Export individual functions untuk backward compatibility
window.copyToClipboard = copyToClipboard;
window.showToast = showToast;
window.showButtonLoading = showButtonLoading;
window.hideButtonLoading = hideButtonLoading;
window.showElement = showElement;
window.hideElement = hideElement;