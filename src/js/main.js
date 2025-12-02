// ========================================
// Main.js - SPA Router & Core Functions
// ========================================

// Global variables sederhana
let currentPage = '';

// Inisialisasi aplikasi ketika DOM sudah siap
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 AI UMKM App initialized');
    
    // Setup router
    setupRouter();
    
    // Setup navigation
    setupNavigation();
    
    // Load halaman pertama
    handleRoute();
});

// Fungsi untuk setup hash router
function setupRouter() {
    // Listen untuk perubahan hash
    window.addEventListener('hashchange', handleRoute);
    
    // Listen untuk back/forward browser
    window.addEventListener('popstate', handleRoute);
}

// Fungsi untuk handle routing
function handleRoute() {
    // Ambil hash dari URL (misal: #/ideas)
    let hash = window.location.hash;
    
    // Default ke home jika tidak ada hash
    if (!hash || hash === '#') {
        hash = '#/';
    }
    
    // Update active navigation
    updateActiveNav(hash);
    
    // Route ke halaman yang sesuai
    if (hash === '#/' || hash === '#/home') {
        loadPage('home');
    } else if (hash === '#/ideas') {
        loadPage('ideas');
    } else if (hash === '#/caption') {
        loadPage('caption');
    } else if (hash === '#/poster') {
        loadPage('poster');
    } else if (hash === '#/products') {
        loadPage('products');
    } else {
        // Halaman tidak ditemukan, redirect ke home
        window.location.hash = '#/';
    }
}

// Fungsi untuk load konten halaman
function loadPage(pageName) {
    console.log(`📄 Loading page: ${pageName}`);
    
    // Update current page
    currentPage = pageName;
    
    // Ambil container app
    const appContainer = document.getElementById('app');
    
    // Show loading
    showLoading(appContainer);
    
    // Fetch konten halaman
    fetch(`src/pages/${pageName}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${pageName}.html`);
            }
            return response.text();
        })
        .then(html => {
            // Load konten dengan fade-in effect
            appContainer.innerHTML = html;
            appContainer.classList.add('fade-in');
            
            // Initialize page-specific JavaScript
            initializePage(pageName);
            
            console.log(`✅ Page ${pageName} loaded successfully`);
        })
        .catch(error => {
            console.error('❌ Error loading page:', error);
            appContainer.innerHTML = `
                <div class="page-container text-center">
                    <h2>Oops! Halaman tidak ditemukan</h2>
                    <p>Terjadi kesalahan saat memuat halaman.</p>
                    <button class="btn btn-primary" onclick="navigateTo('#/')">
                        Kembali ke Home
                    </button>
                </div>
            `;
        });
}

// Fungsi untuk show loading state
function showLoading(container) {
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Memuat halaman...</p>
        </div>
    `;
}

// Fungsi untuk initialize page setelah load
function initializePage(pageName) {
    // Initialize berdasarkan halaman
    if (pageName === 'ideas') {
        initializeIdeasPage();
    } else if (pageName === 'caption') {
        initializeCaptionPage();
    } else if (pageName === 'poster') {
        initializePosterPage();
    } else if (pageName === 'products') {
        initializeProductsPage();
    }
}

// Fungsi untuk update active navigation
function updateActiveNav(currentHash) {
    // Ambil semua nav links
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        // Remove active class dari semua
        link.classList.remove('active');
        
        // Add active ke yang sesuai dengan current hash
        const href = link.getAttribute('href');
        if (href === currentHash || (currentHash === '#/' && href === '#/')) {
            link.classList.add('active');
        }
    });
}

// Fungsi untuk setup navigation events
function setupNavigation() {
    // Add click events ke navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            navigateTo(href);
        });
    });
}

// Fungsi untuk navigate ke URL
function navigateTo(url) {
    // Update hash dan trigger route handler
    window.location.hash = url;
}

// Fungsi global untuk navigate (bisa dipanggil dari HTML onclick)
window.navigateTo = navigateTo;

// Export functions untuk digunakan file lain
window.AppRouter = {
    navigateTo: navigateTo,
    getCurrentPage: () => currentPage,
    handleRoute: handleRoute
};