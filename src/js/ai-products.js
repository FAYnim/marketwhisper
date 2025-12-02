// ========================================
// AI Products - CRUD Data Produk UMKM
// ========================================

// Global state untuk products
let products = [];
let editingProductId = null;

// Fungsi untuk initialize products page
function initializeProductsPage() {
    console.log('📦 Initialize Products Page');
    
    // Load products dari localStorage
    loadProducts();
    
    // Render products
    renderProducts();
}

// Fungsi untuk load products dari localStorage
function loadProducts() {
    try {
        const storedProducts = localStorage.getItem('umkm_products');
        if (storedProducts) {
            products = JSON.parse(storedProducts);
            console.log(`✅ Loaded ${products.length} products from storage`);
        } else {
            products = [];
            console.log('📦 No products found, starting fresh');
        }
    } catch (error) {
        console.error('❌ Error loading products:', error);
        products = [];
    }
}

// Fungsi untuk save products ke localStorage
function saveProducts() {
    try {
        localStorage.setItem('umkm_products', JSON.stringify(products));
        console.log('✅ Products saved to storage');
    } catch (error) {
        console.error('❌ Error saving products:', error);
        showToast('Gagal menyimpan data produk', 'error');
    }
}

// Fungsi untuk render products ke grid
function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (!productsGrid || !emptyState) {
        console.error('Products grid or empty state not found');
        return;
    }
    
    // Show empty state jika tidak ada produk
    if (products.length === 0) {
        emptyState.classList.remove('hidden');
        productsGrid.classList.add('hidden');
        return;
    }
    
    // Hide empty state dan show grid
    emptyState.classList.add('hidden');
    productsGrid.classList.remove('hidden');
    
    // Generate product cards HTML
    let html = '';
    products.forEach(product => {
        html += createProductCard(product);
    });
    
    productsGrid.innerHTML = html;
}

// Fungsi untuk create product card HTML
// Fungsi untuk create product card HTML yang diperbarui
function createProductCard(product) {
    // Gunakan placeholder jika tidak ada gambar
    const imageUrl = product.image && product.image.trim() !== '' 
        ? product.image 
        : 'https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image';
        
    const formattedPrice = formatRupiah(product.price);
    
    return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image" style="background-image: url('${imageUrl}')">
                <div class="product-category">${product.category}</div>
            </div>
            <div class="product-content">
                <h4 class="product-name" title="${product.name}">${product.name}</h4>
                <p class="product-price">${formattedPrice}</p>
                <p class="product-description">${truncateText(product.description, 60)}</p>
                
                <div class="product-actions">
                    <button class="btn btn-small btn-ai-promo" onclick="useProductForAI('${product.id}')">
                        <span>✨</span> Promosi AI
                    </button>
                    
                    <button class="btn btn-small btn-action-outline" onclick="editProduct('${product.id}')">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-small btn-action-danger" onclick="deleteProduct('${product.id}')">
                        🗑️ Hapus
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Fungsi untuk format Rupiah
function formatRupiah(amount) {
    const numberAmount = parseInt(amount);
    if (isNaN(numberAmount)) return 'Rp 0';
    
    return 'Rp ' + numberAmount.toLocaleString('id-ID');
}

// Fungsi untuk truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Fungsi untuk show add product form
function showAddProductForm() {
    const formContainer = document.getElementById('product-form-container');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');
    const form = document.getElementById('product-form');
    
    if (!formContainer) return;
    
    // Reset form
    form.reset();
    document.getElementById('product-id').value = '';
    editingProductId = null;
    
    // Update title
    formTitle.textContent = 'Tambah Produk Baru';
    submitBtn.innerHTML = '💾 Simpan Produk';
    
    // Show form
    formContainer.classList.remove('hidden');
    
    // Scroll to form
    formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Fungsi untuk close product form
function closeProductForm() {
    const formContainer = document.getElementById('product-form-container');
    const form = document.getElementById('product-form');
    
    if (!formContainer) return;
    
    // Hide form
    formContainer.classList.add('hidden');
    
    // Reset form
    form.reset();
    editingProductId = null;
}

// Fungsi untuk handle submit product form
function handleSubmitProduct(event) {
    event.preventDefault();
    
    // Get form values
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value;
    const price = document.getElementById('product-price').value;
    const description = document.getElementById('product-description').value.trim();
    const image = document.getElementById('product-image').value.trim();
    
    // Validation
    if (!name || !category || !price || !description) {
        showToast('Mohon lengkapi semua field yang wajib diisi', 'error');
        return;
    }
    
    // Create or update product object
    const product = {
        id: id || generateId(),
        name: name,
        category: category,
        price: parseInt(price),
        description: description,
        image: image || '',
        createdAt: id ? getProductById(id).createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Add or update product
    if (id) {
        // Update existing product
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = product;
            showToast('Produk berhasil diperbarui!', 'success');
        }
    } else {
        // Add new product
        products.push(product);
        showToast('Produk berhasil ditambahkan!', 'success');
    }
    
    // Save to localStorage
    saveProducts();
    
    // Re-render products
    renderProducts();
    
    // Close form
    closeProductForm();
}

// Fungsi untuk edit product
function editProduct(productId) {
    const product = getProductById(productId);
    
    if (!product) {
        showToast('Produk tidak ditemukan', 'error');
        return;
    }
    
    // Fill form with product data
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-image').value = product.image || '';
    
    // Update form title
    document.getElementById('form-title').textContent = 'Edit Produk';
    document.getElementById('submit-btn').innerHTML = '💾 Update Produk';
    
    // Show form
    const formContainer = document.getElementById('product-form-container');
    formContainer.classList.remove('hidden');
    formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    editingProductId = productId;
}

// Fungsi untuk delete product
function deleteProduct(productId) {
    const product = getProductById(productId);
    
    if (!product) {
        showToast('Produk tidak ditemukan', 'error');
        return;
    }
    
    // Confirm delete
    const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}"?`);
    
    if (confirmDelete) {
        // Remove product
        products = products.filter(p => p.id !== productId);
        
        // Save to localStorage
        saveProducts();
        
        // Re-render products
        renderProducts();
        
        showToast('Produk berhasil dihapus', 'success');
    }
}

// Fungsi untuk get product by ID
function getProductById(productId) {
    return products.find(p => p.id === productId);
}

// Fungsi untuk generate unique ID
function generateId() {
    return 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Fungsi untuk use product for AI promotion
function useProductForAI(productId) {
    const product = getProductById(productId);
    
    if (!product) {
        showToast('Produk tidak ditemukan', 'error');
        return;
    }
    
    // Save selected product to localStorage untuk digunakan di halaman AI
    localStorage.setItem('selected_product', JSON.stringify(product));
    
    // Show options untuk jenis promosi
    const aiOption = confirm(
        `Gunakan produk "${product.name}" untuk promosi AI?\n\n` +
        `OK = Caption Generator\n` +
        `Cancel = Ide Konten`
    );
    
    if (aiOption) {
        // Navigate to caption page
        navigateTo('#/caption');
    } else {
        // Navigate to ideas page
        navigateTo('#/ideas');
    }
    
    showToast(`Produk "${product.name}" dipilih untuk promosi AI`, 'success');
}

// Fungsi untuk get all products (untuk digunakan di halaman lain)
function getAllProducts() {
    return products;
}

// Fungsi untuk get selected product
function getSelectedProduct() {
    try {
        const storedProduct = localStorage.getItem('selected_product');
        if (storedProduct) {
            return JSON.parse(storedProduct);
        }
    } catch (error) {
        console.error('Error getting selected product:', error);
    }
    return null;
}

// Fungsi untuk clear selected product
function clearSelectedProduct() {
    localStorage.removeItem('selected_product');
}

// Export functions ke global scope
window.initializeProductsPage = initializeProductsPage;
window.showAddProductForm = showAddProductForm;
window.closeProductForm = closeProductForm;
window.handleSubmitProduct = handleSubmitProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.useProductForAI = useProductForAI;
window.getAllProducts = getAllProducts;
window.getSelectedProduct = getSelectedProduct;
window.clearSelectedProduct = clearSelectedProduct;
