// ========================================
// Dashboard Analytics & Statistics
// Sistem CRM untuk UMKM
// ========================================

// Global state untuk dashboard
let dashboardData = {
    products: [],
    activities: [],
    aiUsage: 0,
    contentGenerated: 0,
    lastLogin: null
};

// Initialize dashboard
function initializeDashboard() {
    console.log('📊 Initialize Dashboard CRM');
    
    // Load data
    loadDashboardData();
    
    // Render dashboard components
    renderMetrics();
    renderCategoryChart();
    renderRecentActivity();
    renderDynamicTips();
    
    // Setup real-time updates
    setupRealTimeUpdates();
    
    console.log('✅ Dashboard initialized successfully');
}

// Load dashboard data from localStorage and other sources
function loadDashboardData() {
    try {
        // Load products data
        const storedProducts = localStorage.getItem('umkm_products');
        if (storedProducts) {
            dashboardData.products = JSON.parse(storedProducts);
        }
        
        // Load activities
        const storedActivities = localStorage.getItem('umkm_activities');
        if (storedActivities) {
            dashboardData.activities = JSON.parse(storedActivities);
        }
        
        // Load AI usage stats
        const aiUsage = localStorage.getItem('umkm_ai_usage');
        if (aiUsage) {
            dashboardData.aiUsage = parseInt(aiUsage) || 0;
        }
        
        // Load content generated count
        const contentGenerated = localStorage.getItem('umkm_content_generated');
        if (contentGenerated) {
            dashboardData.contentGenerated = parseInt(contentGenerated) || 0;
        }
        
        // Set last login time
        dashboardData.lastLogin = new Date().toLocaleString('id-ID');
        
        console.log('📊 Dashboard data loaded:', dashboardData);
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
    }
}

// Render key metrics cards
function renderMetrics() {
    const totalProducts = dashboardData.products.length;
    const totalCategories = getUniqueCategories().length;
    const aiUsage = dashboardData.aiUsage;
    const contentGenerated = dashboardData.contentGenerated;
    
    // Update metric values
    updateElement('total-products', totalProducts.toString());
    updateElement('total-categories', totalCategories.toString());
    updateElement('ai-usage-count', aiUsage.toString());
    updateElement('content-generated', contentGenerated.toString());
    
    // Update last login time
    updateElement('last-login-time', dashboardData.lastLogin);
}

// Get unique categories from products
function getUniqueCategories() {
    const categories = dashboardData.products.map(product => product.category);
    return [...new Set(categories)].filter(cat => cat && cat.trim() !== '');
}

// Render category distribution chart (simple CSS-based)
function renderCategoryChart() {
    const chartContainer = document.getElementById('category-chart');
    const legendContainer = document.getElementById('category-legend');
    const emptyState = document.getElementById('chart-empty');
    
    if (!chartContainer || !legendContainer) return;
    
    const categories = getUniqueCategories();
    
    if (categories.length === 0) {
        chartContainer.parentElement.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    chartContainer.parentElement.classList.remove('hidden');
    
    // Calculate category distribution
    const categoryData = categories.map(category => {
        const count = dashboardData.products.filter(p => p.category === category).length;
        const percentage = (count / dashboardData.products.length) * 100;
        return { category, count, percentage };
    });
    
    // Colors for categories
    const colors = ['#3B82F6', '#EAB308', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    // Render simple bar chart
    let chartHTML = '<div class="chart-bars">';
    categoryData.forEach((data, index) => {
        const color = colors[index % colors.length];
        chartHTML += `
            <div class="chart-bar">
                <div class="bar-fill" style="width: ${data.percentage}%; background-color: ${color}"></div>
                <span class="bar-label">${data.category} (${data.count})</span>
            </div>
        `;
    });
    chartHTML += '</div>';
    
    chartContainer.innerHTML = chartHTML;
    
    // Render legend
    let legendHTML = '';
    categoryData.forEach((data, index) => {
        const color = colors[index % colors.length];
        legendHTML += `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${color}"></div>
                <span class="legend-text">${data.category}: ${data.count} produk</span>
            </div>
        `;
    });
    
    legendContainer.innerHTML = legendHTML;
}

// Render recent activity
function renderRecentActivity() {
    const activityList = document.getElementById('activity-list');
    const emptyState = document.getElementById('activity-empty');
    
    if (!activityList) return;
    
    if (dashboardData.activities.length === 0) {
        // Generate sample activities based on current data
        generateSampleActivities();
    }
    
    if (dashboardData.activities.length === 0) {
        activityList.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    activityList.classList.remove('hidden');
    
    // Show last 5 activities
    const recentActivities = dashboardData.activities.slice(0, 5);
    
    let html = '';
    recentActivities.forEach(activity => {
        html += `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <p class="activity-text">${activity.text}</p>
                    <p class="activity-time">${formatTimeAgo(activity.timestamp)}</p>
                </div>
            </div>
        `;
    });
    
    activityList.innerHTML = html;
}

// Generate sample activities
function generateSampleActivities() {
    const activities = [];
    
    // Add activities based on products
    if (dashboardData.products.length > 0) {
        const latestProduct = dashboardData.products[dashboardData.products.length - 1];
        activities.push({
            icon: '📦',
            text: `Produk "${latestProduct.name}" ditambahkan`,
            timestamp: new Date(latestProduct.createdAt || Date.now()),
            type: 'product_added'
        });
    }
    
    // Add AI usage activities
    if (dashboardData.aiUsage > 0) {
        activities.push({
            icon: '🤖',
            text: `AI Tools digunakan ${dashboardData.aiUsage} kali`,
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            type: 'ai_usage'
        });
    }
    
    // Add content generation activities
    if (dashboardData.contentGenerated > 0) {
        activities.push({
            icon: '✨',
            text: `${dashboardData.contentGenerated} konten AI berhasil di-generate`,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            type: 'content_generated'
        });
    }
    
    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    dashboardData.activities = activities;
    
    // Save to localStorage
    localStorage.setItem('umkm_activities', JSON.stringify(activities));
}

// Render dynamic tips based on user data
function renderDynamicTips() {
    const tipsContainer = document.getElementById('tips-list');
    if (!tipsContainer) return;
    
    const tips = generateDynamicTips();
    
    let html = '';
    tips.slice(0, 3).forEach(tip => { // Show max 3 tips
        html += `
            <div class="tip-item">
                <div class="tip-icon">${tip.icon}</div>
                <div class="tip-content">
                    <h4>${tip.title}</h4>
                    <p>${tip.description}</p>
                </div>
            </div>
        `;
    });
    
    tipsContainer.innerHTML = html;
}

// Generate dynamic tips based on user data
function generateDynamicTips() {
    const tips = [];
    
    // Tips berdasarkan jumlah produk
    if (dashboardData.products.length === 0) {
        tips.push({
            icon: '📦',
            title: 'Mulai dengan Produk Pertama',
            description: 'Tambahkan produk pertama Anda untuk mulai menggunakan AI marketing tools.'
        });
    } else if (dashboardData.products.length < 5) {
        tips.push({
            icon: '📈',
            title: 'Lengkapi Data Produk',
            description: 'Tambahkan lebih banyak produk untuk hasil AI yang lebih akurat dan beragam.'
        });
    }
    
    // Tips berdasarkan penggunaan AI
    if (dashboardData.aiUsage === 0) {
        tips.push({
            icon: '🤖',
            title: 'Coba AI Tools',
            description: 'Mulai gunakan AI untuk generate ide konten dan caption yang menarik.'
        });
    } else if (dashboardData.aiUsage < 10) {
        tips.push({
            icon: '✨',
            title: 'Eksplorasi Fitur AI',
            description: 'Jelajahi semua fitur AI: Ide Konten, Caption Generator, dan Poster Designer.'
        });
    }
    
    // Tips umum marketing
    tips.push({
        icon: '🎯',
        title: 'Konsistensi Posting',
        description: 'Posting konten secara rutin setiap hari untuk meningkatkan engagement pelanggan.'
    });
    
    tips.push({
        icon: '📸',
        title: 'Foto Produk Berkualitas',
        description: 'Gunakan foto produk dengan pencahayaan baik untuk meningkatkan daya tarik visual.'
    });
    
    tips.push({
        icon: '🤝',
        title: 'Respon Cepat Pelanggan',
        description: 'Balas komentar dan pesan dari pelanggan dalam waktu maksimal 2 jam.'
    });
    
    return tips;
}

// Setup real-time updates
function setupRealTimeUpdates() {
    // Update dashboard setiap 30 detik
    setInterval(() => {
        loadDashboardData();
        renderMetrics();
    }, 30000);
    
    // Listen for storage changes dari tab lain
    window.addEventListener('storage', function(e) {
        if (e.key && e.key.startsWith('umkm_')) {
            console.log('📊 Data updated from another tab');
            loadDashboardData();
            renderMetrics();
            renderCategoryChart();
            renderRecentActivity();
        }
    });
}

// Helper function to update element content safely
function updateElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = content;
    }
}

// Helper function to format time ago
function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
    
    return time.toLocaleDateString('id-ID');
}

// Functions untuk tracking activity (akan dipanggil dari halaman lain)
function trackActivity(type, text, icon = '📝') {
    const activity = {
        icon: icon,
        text: text,
        timestamp: new Date(),
        type: type
    };
    
    // Load existing activities
    const storedActivities = localStorage.getItem('umkm_activities');
    let activities = storedActivities ? JSON.parse(storedActivities) : [];
    
    // Add new activity at the beginning
    activities.unshift(activity);
    
    // Keep only last 50 activities
    activities = activities.slice(0, 50);
    
    // Save back to localStorage
    localStorage.setItem('umkm_activities', JSON.stringify(activities));
    
    console.log('📋 Activity tracked:', text);
}

// Functions untuk tracking AI usage
function incrementAIUsage() {
    const currentUsage = parseInt(localStorage.getItem('umkm_ai_usage')) || 0;
    const newUsage = currentUsage + 1;
    localStorage.setItem('umkm_ai_usage', newUsage.toString());
    
    // Track activity
    trackActivity('ai_usage', 'AI Tools digunakan', '🤖');
}

// Functions untuk tracking content generation
function incrementContentGenerated() {
    const currentCount = parseInt(localStorage.getItem('umkm_content_generated')) || 0;
    const newCount = currentCount + 1;
    localStorage.setItem('umkm_content_generated', newCount.toString());
    
    // Track activity
    trackActivity('content_generated', 'Konten AI berhasil di-generate', '✨');
}

// Export functions ke global scope untuk digunakan halaman lain
window.initializeDashboard = initializeDashboard;
window.trackActivity = trackActivity;
window.incrementAIUsage = incrementAIUsage;
window.incrementContentGenerated = incrementContentGenerated;

// Untuk testing di console
window.dashboardData = dashboardData;