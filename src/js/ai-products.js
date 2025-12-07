let products = [];
let editingProductId = null;

async function initializeProductsPage() {
    console.log('📦 Initialize Products Page');
    
    // Setup image
    setupImageInputSwitcher();
    setupImageUploadPreview();

    showLoadingState();
    
    await loadProducts();
    
    renderProducts();
}

function setupImageInputSwitcher() {
    const switchButtons = document.querySelectorAll('.image-input-switcher .switch-btn');
    if (!switchButtons || switchButtons.length === 0) return;

    switchButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const target = button.getAttribute('data-target');
            setImageInputMode(target);
        });
    });
}

function setImageInputMode(mode) {
    const urlPanel = document.getElementById('image-url-panel');
    const uploadPanel = document.getElementById('image-upload-panel');
    const switchButtons = document.querySelectorAll('.image-input-switcher .switch-btn');
    if (!urlPanel || !uploadPanel || switchButtons.length === 0) return;

    switchButtons.forEach(function(btn) {
        const target = btn.getAttribute('data-target');
        if (target === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (mode === 'upload') {
        urlPanel.classList.add('hidden');
        uploadPanel.classList.remove('hidden');
    } else {
        urlPanel.classList.remove('hidden');
        uploadPanel.classList.add('hidden');
    }
}

function getImageInputMode() {
    const activeBtn = document.querySelector('.image-input-switcher .switch-btn.active');
    if (activeBtn) {
        return activeBtn.getAttribute('data-target');
    }

    const uploadPanel = document.getElementById('image-upload-panel');
    if (uploadPanel && !uploadPanel.classList.contains('hidden')) {
        return 'upload';
    }

    return 'url';
}

function setupImageUploadPreview() {
    const fileInput = document.getElementById('product-image-file');
    const previewImg = document.getElementById('image-preview');
    const placeholder = document.getElementById('image-preview-placeholder');
    if (!fileInput || !previewImg || !placeholder) return;

    fileInput.addEventListener('change', function() {
        const file = fileInput.files && fileInput.files[0];

        if (!file) {
            resetImagePreview();
            return;
        }

        if (!file.type.startsWith('image/')) {
            showToast('❌ File harus berupa gambar (JPG/PNG)');
            fileInput.value = '';
            resetImagePreview();
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showToast('❌ Ukuran gambar maksimal 2MB');
            fileInput.value = '';
            resetImagePreview();
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewImg.classList.remove('hidden');
            placeholder.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    });
}

function resetImagePreview() {
    const previewImg = document.getElementById('image-preview');
    const placeholder = document.getElementById('image-preview-placeholder');
    if (!previewImg || !placeholder) return;

    previewImg.src = '';
    previewImg.classList.add('hidden');
    placeholder.classList.remove('hidden');
}

async function loadProducts() {
    try {
        const result = await ProductsDB.getAll();
        
        if (result.success) {
            products = result.data;
            console.log(`✅ Loaded ${products.length} products from Supabase`);
        } else {
            console.error('❌ Error loading products:', result.error);
            products = [];
            hideLoadingState();
            // Enable tombol meskipun error
            enableAddProductButtons();
            showToast('Gagal memuat produk: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('❌ Error loading products:', error);
        products = [];
        hideLoadingState();
        enableAddProductButtons();
        showToast('Gagal memuat produk', 'error');
    }
}

function showLoadingState() {
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const productsGrid = document.getElementById('products-grid');
    
    if (loadingState) {
        loadingState.classList.remove('hidden');
    }
    if (emptyState) {
        emptyState.classList.add('hidden');
    }
    if (productsGrid) {
        productsGrid.classList.add('hidden');
    }
}

function hideLoadingState() {
    const loadingState = document.getElementById('loading-state');
    
    if (loadingState) {
        loadingState.classList.add('hidden');
    }    
}

function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (!productsGrid || !emptyState) {
        console.error('Products grid or empty state not found');
        return;
    }
    
    hideLoadingState();
    
    enableAddProductButtons();
    
    if (products.length === 0) {
        emptyState.classList.remove('hidden');
        productsGrid.classList.add('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    productsGrid.classList.remove('hidden');
    
    let html = '';
    products.forEach(product => {
        html += createProductCard(product);
    });
    
    productsGrid.innerHTML = html;
}

function createProductCard(product) {
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
                        <i class="fas fa-wand-sparkles"></i> Promosi AI
                    </button>
                    
                    <button class="btn btn-small btn-action-outline" onclick="editProduct('${product.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-small btn-action-danger" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash-alt"></i> Hapus
                    </button>
                </div>
            </div>
        </div>
    `;
}

function formatRupiah(amount) {
    const numberAmount = parseInt(amount);
    if (isNaN(numberAmount)) return 'Rp 0';
    
    return 'Rp ' + numberAmount.toLocaleString('id-ID');
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function showAddProductForm() {
    const formContainer = document.getElementById('product-form-container');
    const formTitle = document.getElementById('form-title');
    const form = document.getElementById('product-form');
    const saveText = document.getElementById('save-text');
    
    if (!formContainer) return;
    
    // Reset form
    form.reset();
    resetImageInputs();
    editingProductId = null;
    
    formTitle.textContent = 'Tambah Produk Baru';
    if (saveText) {
        saveText.textContent = 'Simpan Produk';
    }
    
    formContainer.classList.remove('hidden');
    
    formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeProductForm() {
    const formContainer = document.getElementById('product-form-container');
    const form = document.getElementById('product-form');
    
    if (!formContainer) return;
    
    formContainer.classList.add('hidden');
    
    form.reset();
    resetImageInputs();
    editingProductId = null;
}

async function handleSubmitProduct(event) {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value;
    const price = document.getElementById('product-price').value;
    const description = document.getElementById('product-description').value.trim();
    const imageInput = document.getElementById('product-image');
    const fileInput = document.getElementById('product-image-file');
    const imageMode = getImageInputMode();
    const imageUrlValue = imageInput ? imageInput.value.trim() : '';
    
    // Validation
    if (!name || !category || !price || !description) {
        showToast('❌ Mohon lengkapi semua field yang wajib diisi');
        return;
    }
    
    const saveBtn = document.getElementById('save-product');
    const saveText = document.getElementById('save-text');
    const saveSpinner = document.getElementById('save-spinner');
    
    if (saveBtn && saveText && saveSpinner) {
        saveBtn.disabled = true;
        saveText.textContent = editingProductId ? 'Mengupdate...' : 'Menyimpan...';
        saveSpinner.classList.remove('hidden');
    }
    
    try {
        let finalImageUrl = imageUrlValue;

        if (imageMode === 'upload') {
            const file = fileInput && fileInput.files ? fileInput.files[0] : null;
            if (!file) {
                showToast('❌ Pilih file gambar atau ganti ke mode URL');
                if (saveBtn && saveText && saveSpinner) {
                    saveBtn.disabled = false;
                    saveText.textContent = 'Simpan Produk';
                    saveSpinner.classList.add('hidden');
                }
                return;
            }

            if (saveText) {
                saveText.textContent = 'Mengunggah...';
            }

            const uploadResult = await ImageUploader.uploadImage(file, 'products');
            if (!uploadResult.success) {
                throw new Error(uploadResult.error || 'Upload gambar gagal');
            }

            finalImageUrl = uploadResult.url || '';

            if (saveText) {
                saveText.textContent = editingProductId ? 'Mengupdate...' : 'Menyimpan...';
            }
        }

        const productData = {
            name: name,
            category: category,
            price: parseInt(price),
            description: description,
            image: finalImageUrl || ''
        };
        
        let result;
        
        if (editingProductId) {
            result = await ProductsDB.update(editingProductId, productData);
            
            if (result.success) {
                const index = products.findIndex(p => p.id === editingProductId);
                if (index !== -1) {
                    products[index] = result.data;
                }
                showToast('✅ Produk berhasil diperbarui!');
            } else {
                throw new Error(result.error);
            }
        } else {
            result = await ProductsDB.create(productData);
            
            if (result.success) {
                products.unshift(result.data);
                showToast('✅ Produk berhasil ditambahkan!');
            } else {
                throw new Error(result.error);
            }
        }
        
        renderProducts();
        
        closeProductForm();
        
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('❌ Gagal menyimpan produk: ' + error.message);
    } finally {
        if (saveBtn && saveText && saveSpinner) {
            saveBtn.disabled = false;
            saveText.textContent = 'Simpan Produk';
            saveSpinner.classList.add('hidden');
        }
    }
}

function editProduct(productId) {
    const product = getProductById(productId);
    
    if (!product) {
        showToast('❌ Produk tidak ditemukan');
        return;
    }

    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-image').value = product.image || '';
    setImageInputMode('url');
    resetImagePreview();
    
    document.getElementById('form-title').textContent = 'Edit Produk';
    const saveText = document.getElementById('save-text');
    if (saveText) {
        saveText.textContent = 'Update Produk';
    }
    
    const formContainer = document.getElementById('product-form-container');
    formContainer.classList.remove('hidden');
    formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    editingProductId = productId;
}

function resetImageInputs() {
    const urlInput = document.getElementById('product-image');
    const fileInput = document.getElementById('product-image-file');

    if (urlInput) {
        urlInput.value = '';
    }

    if (fileInput) {
        fileInput.value = '';
    }

    resetImagePreview();
    setImageInputMode('url');
}

async function deleteProduct(productId) {
    const product = getProductById(productId);
    
    if (!product) {
        showToast('❌ Produk tidak ditemukan');
        return;
    }
    
    const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}"?`);
    
    if (confirmDelete) {
        try {
            const result = await ProductsDB.delete(productId);
            
            if (result.success) {
                products = products.filter(p => p.id !== productId);
                
                renderProducts();
                
                showToast('✅ Produk berhasil dihapus');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            showToast('❌ Gagal menghapus produk: ' + error.message);
        }
    }
}

function getProductById(productId) {
    return products.find(p => p.id === productId);
}

function generateId() {
    return 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function disableAddProductButtons() {
    const addProductBtn = document.getElementById('add-product-btn');
    
    if (addProductBtn) {
        addProductBtn.disabled = true;
        addProductBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat...';
    }
}

// Fungsi untuk enable tombol tambah produk
function enableAddProductButtons() {
    const addProductBtn = document.getElementById('add-product-btn');
    
    if (addProductBtn) {
        addProductBtn.disabled = false;
        addProductBtn.innerHTML = '<i class="fas fa-plus"></i> Tambah Produk Baru';
    }
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
    
    // Tampilkan custom pop up untuk pilih jenis promosi
    showPromoPopup(product);
}

// Fungsi untuk menampilkan pop up pilih jenis promosi
function showPromoPopup(product) {
    const popup = document.getElementById('promo-popup-overlay');
    const productNameEl = document.getElementById('selected-product-name');
    
    if (!popup || !productNameEl) {
        console.error('Pop up elements not found');
        return;
    }
    
    // Set nama produk di pop up
    productNameEl.textContent = product.name;
    
    // Tampilkan pop up
    popup.classList.remove('hidden');
    
    // Prevent body scroll when pop up is open
    document.body.style.overflow = 'hidden';
}

// Fungsi untuk menutup pop up promosi
function closePromoPopup() {
    const popup = document.getElementById('promo-popup-overlay');
    
    if (popup) {
        popup.classList.add('hidden');
    }
    
    // Re-enable body scroll
    document.body.style.overflow = '';
}

// Fungsi untuk redirect ke halaman Ide Konten
function goToIdeasPage() {
    closePromoPopup();
    showToast('Mengarahkan ke halaman Ide Konten...');
    
    // Redirect setelah delay kecil agar toast terlihat
    setTimeout(() => {
        window.location.href = 'ideas.html';
    }, 500);
}

// Fungsi untuk redirect ke halaman Caption
function goToCaptionPage() {
    closePromoPopup();
    showToast('Mengarahkan ke halaman Caption AI...');
    
    // Redirect setelah delay kecil agar toast terlihat
    setTimeout(() => {
        window.location.href = 'caption.html';
    }, 500);
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
    const productInfo = document.getElementById('selected-product-info');
    if (productInfo) {
        productInfo.classList.add('hidden');
    }
}

// Fungsi untuk refresh products (reload dari database)
async function refreshProducts() {
    console.log('🔄 Refreshing products...');
    
    // Disable tombol saat refresh
    disableAddProductButtons();
    
    // Show loading state
    showLoadingState();
    
    // Load products dari Supabase
    await loadProducts();
    
    // Render products
    renderProducts();
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
window.refreshProducts = refreshProducts;
window.showLoadingState = showLoadingState;
window.hideLoadingState = hideLoadingState;
window.showPromoPopup = showPromoPopup;
window.closePromoPopup = closePromoPopup;
window.goToIdeasPage = goToIdeasPage;
window.goToCaptionPage = goToCaptionPage;
