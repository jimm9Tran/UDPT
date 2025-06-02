const axios = require('axios');
const fs = require('fs');

async function createTestProduct() {
    console.log('🏭 Creating test product for inventory testing...');
    
    try {
        // Read session cookie
        const sessionCookie = fs.readFileSync('./session-cookie.txt', 'utf8').trim();
        
        const productData = {
            title: 'Test Product - Inventory Test',
            price: 299.99,
            brand: 'Apple',  // Use a valid enum value
            category: 'smartphone',
            description: 'Test product for inventory management and race condition testing',
            countInStock: 1,  // Only 1 in stock to test race conditions
            userId: 'test-user-id',  // Add required userId field
            images: {
                image1: 'https://example.com/test-product.jpg'  // Required image field
            }
        };
        
        const response = await axios.post('http://localhost:4000/api/products', productData, {
            headers: {
                'Cookie': sessionCookie
            }
        });
        console.log('✅ Product created successfully!');
        console.log('🆔 Product ID:', response.data.id || response.data._id);
        console.log('📦 Stock:', response.data.countInStock);
        console.log('💰 Price:', response.data.price);
        console.log('Full response:', JSON.stringify(response.data, null, 2));
        
        return response.data;
        
    } catch (error) {
        console.error('❌ Failed to create product:', error.response?.status, error.response?.data || error.message);
        throw error;
    }
}

createTestProduct();
