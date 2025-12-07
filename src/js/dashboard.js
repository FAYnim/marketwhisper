let dashboardData = {
    products: [],
    activities: [],
    aiUsage: 0,
    contentGenerated: 0,
    lastLogin: null
};

async function initializeDashboard() {
    console.log('📊 Initialize Dashboard CRM');
    
    showDashboardLoading();
    
    await loadDashboardData();
    
    hideDashboardLoading();
    
    renderMetrics();
    renderCategoryChart();
    renderRecentActivity();
    renderDynamicTips();
    
    setupRealTimeUpdates();
    
    console.log('✅ Dashboard initialized successfully');
}

async function loadDashboardData() {
    try {
        console.log('📊 Loading dashboard data from Supabase...');
        
        if (typeof ProductsDB !== 'undefined') {
            const productsResult = await ProductsDB.getAll();
            if (productsResult.success) {
                dashboardData.products = productsResult.data;
                console.log(`✅ Loaded ${productsResult.data.length} products from Supabase`);
            } else {
                console.error('❌ Error loading products from Supabase:', productsResult.error);
                const storedProducts = localStorage.getItem('umkm_products');
                dashboardData.products = storedProducts ? JSON.parse(storedProducts) : [];
            }
        } else {
            console.warn('⚠️ ProductsDB not available, using localStorage fallback');
            const storedProducts = localStorage.getItem('umkm_products');
            dashboardData.products = storedProducts ? JSON.parse(storedProducts) : [];
        }
        
        const storedActivities = localStorage.getItem('umkm_activities');
        if (storedActivities) {
            dashboardData.activities = JSON.parse(storedActivities);
        }
        
        const { aiUsage, contentGenerated } = await fetchAIUsageStats();
        dashboardData.aiUsage = aiUsage;
        dashboardData.contentGenerated = contentGenerated;
        
        dashboardData.lastLogin = new Date().toLocaleString('id-ID');
        
        console.log('📊 Dashboard data loaded:', dashboardData);
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        dashboardData.products = [];
        dashboardData.activities = [];
        dashboardData.aiUsage = 0;
        dashboardData.contentGenerated = 0;
        dashboardData.lastLogin = new Date().toLocaleString('id-ID');
    }
}

// stat ai usage
async function fetchAIUsageStats() {
    const fallback = () => {
        const aiUsageLS = localStorage.getItem('umkm_ai_usage');
        const contentLS = localStorage.getItem('umkm_content_generated');
        return {
            aiUsage: aiUsageLS ? parseInt(aiUsageLS) || 0 : 0,
            contentGenerated: contentLS ? parseInt(contentLS) || 0 : 0
        };
    };

    try {
        if (typeof supabase === 'undefined') {
            return fallback();
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return fallback();
        }

        const { count, error } = await supabase
            .from('ai_usage')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Error fetching ai_usage stats:', error.message);
            return fallback();
        }

        return {
            aiUsage: count || 0,
            contentGenerated: count || 0
        };
    } catch (err) {
        console.error('❌ Unexpected error fetching ai_usage stats:', err);
        return fallback();
    }
}

function renderMetrics() {
    const totalProducts = dashboardData.products.length;
    const totalCategories = getUniqueCategories().length;
    const aiUsage = dashboardData.aiUsage;
    const contentGenerated = dashboardData.contentGenerated;
    
    updateElement('total-products', totalProducts.toString());
    updateElement('total-categories', totalCategories.toString());
    updateElement('ai-usage-count', aiUsage.toString());
    updateElement('content-generated', contentGenerated.toString());
    
    updateElement('last-login-time', dashboardData.lastLogin);
}

function getUniqueCategories() {
    const categories = dashboardData.products.map(product => product.category);
    return [...new Set(categories)].filter(cat => cat && cat.trim() !== '');
}

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
    
    const categoryData = categories.map(category => {
        const count = dashboardData.products.filter(p => p.category === category).length;
        const percentage = (count / dashboardData.products.length) * 100;
        return { category, count, percentage };
    });
    
    const colors = ['#3B82F6', '#EAB308', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
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

function generateSampleActivities() {
    const activities = [];
    
    if (dashboardData.products.length > 0) {
        const sortedProducts = [...dashboardData.products].sort((a, b) => 
            new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        
        sortedProducts.slice(0, 3).forEach((product, index) => {
            activities.push({
                icon: '📦',
                text: `Produk "${product.name}" ditambahkan ke ${product.category}`,
                timestamp: new Date(product.created_at || Date.now() - (index * 60 * 60 * 1000)),
                type: 'product_added'
            });
        });
    }
    
    const categories = getUniqueCategories();
    if (categories.length > 0) {
        categories.forEach((category, index) => {
            const count = dashboardData.products.filter(p => p.category === category).length;
            if (count > 0) {
                activities.push({
                    icon: '📂',
                    text: `${count} produk dalam kategori ${category}`,
                    timestamp: new Date(Date.now() - ((index + 1) * 24 * 60 * 60 * 1000)),
                    type: 'category_update'
                });
            }
        });
    }
    
    if (dashboardData.aiUsage > 0) {
        activities.push({
            icon: '🤖',
            text: `AI Tools digunakan ${dashboardData.aiUsage} kali`,
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
            type: 'ai_usage'
        });
    }
    
    if (dashboardData.contentGenerated > 0) {
        activities.push({
            icon: '✨',
            text: `${dashboardData.contentGenerated} konten AI berhasil di-generate`,
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            type: 'content_generated'
        });
    }
    
    activities.push({
        icon: '👋',
        text: 'Selamat datang kembali!',
        timestamp: new Date(),
        type: 'user_login'
    });
    
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    dashboardData.activities = activities.slice(0, 10);
    
    localStorage.setItem('umkm_activities', JSON.stringify(dashboardData.activities));
}

function renderDynamicTips() {
    const tipsContainer = document.getElementById('tips-list');
    if (!tipsContainer) return;
    
    const tips = generateDynamicTips();
    
    let html = '';
    tips.slice(0, 3).forEach(tip => { // max 3 tips
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

function setupRealTimeUpdates() {
    setInterval(async () => {
        console.log('🔄 Auto-refreshing dashboard data...');
        await loadDashboardData();
        renderMetrics();
        renderCategoryChart();
    }, 60000);
    
    window.addEventListener('storage', function(e) {
        if (e.key && e.key.startsWith('umkm_')) {
            console.log('📊 Data updated from another tab');
            const aiUsage = localStorage.getItem('umkm_ai_usage');
            const contentGenerated = localStorage.getItem('umkm_content_generated');
            const activities = localStorage.getItem('umkm_activities');
            
            if (aiUsage) dashboardData.aiUsage = parseInt(aiUsage) || 0;
            if (contentGenerated) dashboardData.contentGenerated = parseInt(contentGenerated) || 0;
            if (activities) dashboardData.activities = JSON.parse(activities);
            
            renderMetrics();
            renderRecentActivity();
        }
    });
}

function updateElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = content;
    }
}

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

function trackActivity(type, text, icon = '📝') {
    const activity = {
        icon: icon,
        text: text,
        timestamp: new Date(),
        type: type
    };
    
    const storedActivities = localStorage.getItem('umkm_activities');
    let activities = storedActivities ? JSON.parse(storedActivities) : [];
    
    activities.unshift(activity);
    
    activities = activities.slice(0, 50);
    
    localStorage.setItem('umkm_activities', JSON.stringify(activities));
    
    console.log('📋 Activity tracked:', text);
}

function incrementAIUsage() {
    const currentUsage = parseInt(localStorage.getItem('umkm_ai_usage')) || 0;
    const newUsage = currentUsage + 1;
    localStorage.setItem('umkm_ai_usage', newUsage.toString());
    
    trackActivity('ai_usage', 'AI Tools digunakan', '🤖');
}

function incrementContentGenerated() {
    const currentCount = parseInt(localStorage.getItem('umkm_content_generated')) || 0;
    const newCount = currentCount + 1;
    localStorage.setItem('umkm_content_generated', newCount.toString());
    
    trackActivity('content_generated', 'Konten AI berhasil di-generate', '✨');
}

function showDashboardLoading() {
    updateElement('total-products', 'Loading...');
    updateElement('total-categories', 'Loading...');
    updateElement('ai-usage-count', 'Loading...');
    updateElement('content-generated', 'Loading...');
    
    console.log('📊 Dashboard loading state shown');
}

function hideDashboardLoading() {
    console.log('📊 Dashboard loading state hidden');
}

async function refreshDashboard() {
    console.log('🔄 Manual dashboard refresh initiated');
    showDashboardLoading();
    
    try {
        await loadDashboardData();
        renderMetrics();
        renderCategoryChart();
        renderRecentActivity();
        renderDynamicTips();
        
        // Show success toast jika ada
        if (typeof showToast !== 'undefined') {
            showToast('Dashboard berhasil di-refresh!', 'success');
        }
        
    } catch (error) {
        console.error('❌ Error refreshing dashboard:', error);
        if (typeof showToast !== 'undefined') {
            showToast('Gagal refresh dashboard', 'error');
        }
    } finally {
        hideDashboardLoading();
    }
}

async function getDashboardStats() {
    try {
        await loadDashboardData();
        
        return {
            totalProducts: dashboardData.products.length,
            totalCategories: getUniqueCategories().length,
            aiUsage: dashboardData.aiUsage,
            contentGenerated: dashboardData.contentGenerated,
            categoryDistribution: getUniqueCategories().map(category => ({
                category,
                count: dashboardData.products.filter(p => p.category === category).length
            })),
            lastUpdate: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('❌ Error getting dashboard stats:', error);
        return null;
    }
}

window.initializeDashboard = initializeDashboard;
window.trackActivity = trackActivity;
window.incrementAIUsage = incrementAIUsage;
window.incrementContentGenerated = incrementContentGenerated;
window.refreshDashboard = refreshDashboard;
window.getDashboardStats = getDashboardStats;

window.dashboardData = dashboardData;