const PRODUCTS_FUNCTION_URL = '/.netlify/functions/products';

async function callProductsFunction(action, payload = {}) {
    try {
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

window.ProductsDB = ProductsDB;
