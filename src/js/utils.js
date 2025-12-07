function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    
    if (!element) {
        console.error('Element not found:', elementId);
        return;
    }
    
    const text = element.textContent || element.innerText;
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('✅ Berhasil disalin ke clipboard!');
            console.log('📋 Text copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            fallbackCopyText(text);
        });
    } else {
        fallbackCopyText(text);
    }
}

function fallbackCopyText(text) {
    // tmp textarea
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    document.body.appendChild(textArea);
    
    // copy
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
    
    // hapus element
    document.body.removeChild(textArea);
}

function showToast(message, duration = 3000) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast hidden';
        toast.innerHTML = '<p id="toast-message"></p>';
        document.body.appendChild(toast);
    }
    
    // Update message
    const messageEl = document.getElementById('toast-message');
    messageEl.textContent = message;
    
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
    
    console.log('🔔 Toast shown:', message);
}

function showButtonLoading(buttonId, loadingText = 'Loading...') {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    const originalText = button.querySelector('.btn-text');
    if (originalText) {
        originalText.textContent = loadingText;
    }
    
    const spinner = button.querySelector('.btn-spinner');
    if (spinner) {
        spinner.classList.remove('hidden');
    }
    
    button.disabled = true;
    button.style.opacity = '0.7';
}

function hideButtonLoading(buttonId, originalText = 'Generate') {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    const textEl = button.querySelector('.btn-text');
    if (textEl) {
        textEl.textContent = originalText;
    }
    
    const spinner = button.querySelector('.btn-spinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
    
    button.disabled = false;
    button.style.opacity = '1';
}

// Show/Hide
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

// format teks
function formatTextWithBreaks(text) {
    return text.replace(/\n/g, '<br>');
}

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

function safeJsonParse(jsonString, fallback = null) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('JSON Parse Error:', error);
        return fallback;
    }
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

// AI Log
async function logAIUsage(aiType, prompt, resultData, productId = null) {
    try {
        if (typeof supabase === 'undefined') return;

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return;

        const payload = {
            user_id: user.id,
            ai_type: aiType,
            prompt: typeof prompt === 'string' ? prompt : JSON.stringify(prompt),
            result: typeof resultData === 'string' ? resultData : JSON.stringify(resultData),
            product_id: productId || null
        };

        const { error } = await supabase.from('ai_usage').insert([payload]);
        if (error) {
            console.error('❌ Error logging AI usage:', error.message);
        }
    } catch (error) {
        console.error('❌ Unexpected error logging AI usage:', error);
    }
}

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
    generateId,
    logAIUsage
};

// Export individual functions untuk backward compatibility
window.copyToClipboard = copyToClipboard;
window.showToast = showToast;
window.showButtonLoading = showButtonLoading;
window.hideButtonLoading = hideButtonLoading;
window.showElement = showElement;
window.hideElement = hideElement;
window.logAIUsage = logAIUsage;