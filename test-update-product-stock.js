const axios = require('axios');

const BASE_URLS = {
    user: 'http://localhost:3000',
    product: 'http://localhost:3001', 
    order: 'http://localhost:3002',
    payment: 'http://localhost:3003'
};

async function checkServiceHealth(serviceName, url) {
    try {
        const response = await axios.get(`${url}/api/health`);
        if (response.status === 200) {
            console.log(`✅ ${serviceName} Service is healthy`);
            return true;
        }
    } catch (error) {
        console.log(`❌ ${serviceName} Service is not ready`);
        return false;
    }
}

async function waitForServices() {
    console.log('🔍 Waiting for services to be ready...');
    const services = [
        ['Product', BASE_URLS.product]
    ];
    
    for (const [name, url] of services) {
        const isReady = await checkServiceHealth(name, url);
        if (!isReady) {
            throw new Error(`${name} service is not ready`);
        }
    }
}

async function loginAdmin() {
    try {
        const response = await axios.post(`${BASE_URLS.user}/api/users/signin`, {
            email: 'admin@test.com',
            password: 'admin123'
        });
        
        if (response.data && response.data.token) {
            console.log('✅ Admin login successful');
            return response.data.token;
        } else {
            throw new Error('No token received from login');
        }
    } catch (error) {
        console.error('❌ Admin login failed:', error.response?.data || error.message);
        throw error;
    }
}

async function getProducts(token) {
    try {
        const response = await axios.get(`${BASE_URLS.product}/api/products`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log(`✅ Found ${response.data.products.length} products`);
        return response.data.products;
    } catch (error) {
        console.error('❌ Failed to fetch products:', error.response?.data || error.message);
        throw error;
    }
}

async function updateProductStock(token, productId, newStock) {
    try {
        // First get current product data
        const getResponse = await axios.get(`${BASE_URLS.product}/api/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const currentProduct = getResponse.data;
        console.log(`📦 Current product stock: ${currentProduct.countInStock}`);
        
        // Update with new stock
        const updateData = {
            ...currentProduct,
            countInStock: newStock,
            // Ensure required fields are present
            title: currentProduct.title,
            description: currentProduct.description,
            price: currentProduct.price,
            brand: currentProduct.brand,
            category: currentProduct.category,
            images: currentProduct.images || {},
            features: currentProduct.features || [],
            tags: currentProduct.tags || [],
            inTheBox: currentProduct.inTheBox || []
        };
        
        const response = await axios.patch(`${BASE_URLS.product}/api/products/${productId}`, updateData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`✅ Product stock updated to ${newStock}`);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to update product stock:', error.response?.data || error.message);
        throw error;
    }
}

async function main() {
    try {
        console.log('🧪 Update Product Stock Test');
        console.log('==============================');
        
        await waitForServices();
        
        // Login as admin
        const token = await loginAdmin();
        
        // Get products
        const products = await getProducts(token);
        
        if (products.length === 0) {
            console.log('❌ No products found');
            return;
        }
        
        // Find a product with 0 stock
        const productToUpdate = products.find(p => p.countInStock === 0);
        
        if (!productToUpdate) {
            console.log('✅ All products have stock > 0');
            // Show current stock levels
            products.forEach(p => {
                console.log(`📦 ${p.title}: stock=${p.countInStock}`);
            });
            return;
        }
        
        console.log(`📦 Found product with 0 stock: ${productToUpdate.title} (ID: ${productToUpdate._id})`);
        
        // Update stock to 10
        await updateProductStock(token, productToUpdate._id, 10);
        
        // Verify the update
        const updatedProducts = await getProducts(token);
        const updatedProduct = updatedProducts.find(p => p._id === productToUpdate._id);
        console.log(`✅ Verification: ${updatedProduct.title} now has stock=${updatedProduct.countInStock}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

main();
