const axios = require('axios');
const FormData = require('form-data');

const API_HOST = 'http://localhost:4000'; // API Gateway

async function testUpdateProductStockViaBrowser() {
    try {
        console.log('🧪 Update Product Stock via Browser API Test');
        console.log('==========================================');
        
        // Step 1: Login as admin
        console.log('🔐 Step 1: Logging in as admin...');
        const loginResponse = await axios.post(`${API_HOST}/api/users/signin`, {
            email: 'admin@test.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Admin login successful');
        
        // Step 2: Get the product with 0 stock
        console.log('📦 Step 2: Finding product with 0 stock...');
        const productsResponse = await axios.get(`${API_HOST}/api/products`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const products = productsResponse.data.products;
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
        
        // Step 3: Update using FormData (like frontend does)
        console.log('🔄 Step 3: Updating product stock using FormData...');
        
        const formData = new FormData();
        formData.append('title', productToUpdate.title);
        formData.append('description', productToUpdate.description);
        formData.append('price', productToUpdate.price);
        formData.append('brand', productToUpdate.brand);
        formData.append('category', productToUpdate.category);
        formData.append('countInStock', '10'); // Update stock to 10
        formData.append('features', JSON.stringify(productToUpdate.features || []));
        formData.append('tags', JSON.stringify(productToUpdate.tags || []));
        formData.append('inTheBox', JSON.stringify(productToUpdate.inTheBox || []));
        
        // Add existing images
        if (productToUpdate.images) {
            if (productToUpdate.images.image1) formData.append('existingImages[0]', productToUpdate.images.image1);
            if (productToUpdate.images.image2) formData.append('existingImages[1]', productToUpdate.images.image2);
            if (productToUpdate.images.image3) formData.append('existingImages[2]', productToUpdate.images.image3);
            if (productToUpdate.images.image4) formData.append('existingImages[3]', productToUpdate.images.image4);
        }
        
        const updateResponse = await axios.patch(`${API_HOST}/api/products/${productToUpdate._id}`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...formData.getHeaders()
            }
        });
        
        console.log(`✅ Product stock updated successfully!`);
        console.log(`📦 New stock level: ${updateResponse.data.countInStock}`);
        
        // Step 4: Verify the update
        console.log('🔍 Step 4: Verifying the update...');
        const verifyResponse = await axios.get(`${API_HOST}/api/products`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const updatedProducts = verifyResponse.data.products;
        const updatedProduct = updatedProducts.find(p => p._id === productToUpdate._id);
        
        console.log(`✅ Verification successful: ${updatedProduct.title} now has stock=${updatedProduct.countInStock}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testUpdateProductStockViaBrowser();
