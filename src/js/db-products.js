// ========================================
// Database Products - Netlify Functions CRUD Operations
// ========================================
// AMAN - Operasi database lewat Netlify Functions
// Kredensial Supabase tidak terexpose di frontend

// URL Netlify Function untuk products
const PRODUCTS_FUNCTION_URL = '/.netlify/functions/products';

// Helper: Panggil Netlify Function untuk Products
async function callProductsFunction(action, payload = {}) {
    try {
        // Ambil access token dari session
        const session = getStoredSession ? getStoredSession() : null;
        const accessToken = session ? session.access_token : null;

        const response = await fetch(PRODUCTS_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action,
                accessToken,
                ...payload
            })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Products function call error:', error);
        return { success: false, error: error.message };
    }
}

const ProductsDB = {
    // Create: Tambah produk baru
    async create(productData) {
        try {
            const result = await callProductsFunction('create', {
                productData
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            console.log('✅ Product created:', result.data);
            return { success: true, data: result.data };

        } catch (error) {
            console.error('❌ Error creating product:', error);
            return { success: false, error: error.message };
        }
    },

    // Read: Ambil semua produk user
    async getAll() {
        try {
            const result = await callProductsFunction('getAll');

            if (!result.success) {
                throw new Error(result.error);
            }

            console.log(`✅ Loaded ${result.data.length} products`);
            return { success: true, data: result.data };

        } catch (error) {
            console.error('❌ Error loading products:', error);
            return { success: false, error: error.message, data: [] };
        }
    },

    // Read: Ambil satu produk by ID
    async getById(productId) {
        try {
            const result = await callProductsFunction('getById', {
                productId
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            return { success: true, data: result.data };

        } catch (error) {
            console.error('❌ Error getting product:', error);
            return { success: false, error: error.message };
        }
    },

    // Update: Update produk
    async update(productId, productData) {
        try {
            const result = await callProductsFunction('update', {
                productId,
                productData
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            console.log('✅ Product updated:', result.data);
            return { success: true, data: result.data };

        } catch (error) {
            console.error('❌ Error updating product:', error);
            return { success: false, error: error.message };
        }
    },

    // Delete: Hapus produk
    async delete(productId) {
        try {
            const result = await callProductsFunction('delete', {
                productId
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            console.log('✅ Product deleted:', result.data);
            return { success: true, data: result.data };

        } catch (error) {
            console.error('❌ Error deleting product:', error);
            return { success: false, error: error.message };
        }
    },

    // Get products by category
    async getByCategory(category) {
        try {
            const result = await callProductsFunction('getByCategory', {
                category
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            return { success: true, data: result.data };

        } catch (error) {
            console.error('❌ Error getting products by category:', error);
            return { success: false, error: error.message, data: [] };
        }
    },

    // Search products by name
    async search(searchTerm) {
        try {
            const result = await callProductsFunction('search', {
                searchTerm
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            return { success: true, data: result.data };

        } catch (error) {
            console.error('❌ Error searching products:', error);
            return { success: false, error: error.message, data: [] };
        }
    },

    // Get products count
    async count() {
        try {
            const result = await callProductsFunction('count');

            if (!result.success) {
                throw new Error(result.error);
            }

            return { success: true, count: result.count };

        } catch (error) {
            console.error('❌ Error counting products:', error);
            return { success: false, error: error.message, count: 0 };
        }
    },

    // Get category distribution for dashboard
    async getCategoryStats() {
        try {
            const result = await callProductsFunction('getCategoryStats');

            if (!result.success) {
                throw new Error(result.error);
            }

            return { success: true, data: result.data };

        } catch (error) {
            console.error('❌ Error getting category stats:', error);
            return { success: false, error: error.message, data: {} };
        }
    }
};

// Export ke global scope
window.ProductsDB = ProductsDB;
