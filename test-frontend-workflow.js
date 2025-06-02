const axios = require('axios');

const API_HOST = 'http://localhost:4000';
const FRONTEND_HOST = 'http://localhost:3005';

async function testFrontendWorkflow() {
  console.log('🧪 Testing Frontend Admin Workflow...\n');

  try {
    // Step 1: Test Login API that frontend would use
    console.log('1️⃣ Testing admin login...');
    const loginResponse = await axios.post(`${API_HOST}/api/users/signin`, {
      email: 'admin@test.com',
      password: 'admin123'
    });

    const { token } = loginResponse.data;
    console.log('✅ Admin login successful');
    console.log('   📧 Email:', loginResponse.data.user.email);
    console.log('   👑 Admin status:', loginResponse.data.user.isAdmin);
    console.log('   🔑 Token received:', token ? 'Yes' : 'No');

    // Step 2: Test product creation with form data (as frontend would send)
    console.log('\n2️⃣ Testing product creation with form data...');
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add product data as frontend would
    formData.append('title', 'Frontend Admin Test Product');
    formData.append('description', 'Product created through frontend admin interface simulation');
    formData.append('price', '1299000');
    formData.append('brand', 'Samsung');
    formData.append('category', 'Điện thoại');
    formData.append('countInStock', '5');
    formData.append('features', JSON.stringify(['High Resolution Display', '5G Ready', 'Fast Charging']));
    formData.append('tags', JSON.stringify(['smartphone', 'premium', 'new']));
    formData.append('inTheBox', JSON.stringify(['Phone', 'Charger', 'USB Cable', 'Manual']));
    formData.append('isActive', 'true');
    formData.append('isFeatured', 'false');

    const createResponse = await axios.post(`${API_HOST}/api/products`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Product created successfully');
    console.log('   📦 Product ID:', createResponse.data.id);
    console.log('   📝 Title:', createResponse.data.title);
    console.log('   💰 Price:', createResponse.data.price.toLocaleString('vi-VN') + 'đ');
    console.log('   🏷️ Brand:', createResponse.data.brand);
    console.log('   📱 Category:', createResponse.data.category);

    // Step 3: Test product listing (as frontend admin would fetch)
    console.log('\n3️⃣ Testing product listing...');
    const listResponse = await axios.get(`${API_HOST}/api/products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const products = listResponse.data.products || listResponse.data;
    console.log('✅ Product list retrieved');
    console.log('   📊 Total products:', products.length);
    console.log('   🆕 Recently created product found:', 
      products.some(p => p.title === 'Frontend Admin Test Product') ? 'Yes' : 'No');

    // Step 4: Test product update
    console.log('\n4️⃣ Testing product update...');
    const productId = createResponse.data.id;
    const updateFormData = new FormData();
    updateFormData.append('title', 'Updated Frontend Admin Test Product');
    updateFormData.append('description', 'Updated description through admin interface');
    updateFormData.append('price', '1399000');
    updateFormData.append('brand', 'Samsung');
    updateFormData.append('category', 'Điện thoại');
    updateFormData.append('countInStock', '8');

    const updateResponse = await axios.patch(`${API_HOST}/api/products/${productId}`, updateFormData, {
      headers: {
        ...updateFormData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Product updated successfully');
    console.log('   📝 New title:', updateResponse.data.title);
    console.log('   💰 New price:', updateResponse.data.price.toLocaleString('vi-VN') + 'đ');

    // Step 5: Test product deletion
    console.log('\n5️⃣ Testing product deletion...');
    await axios.delete(`${API_HOST}/api/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Product deleted successfully');

    // Step 6: Test frontend accessibility
    console.log('\n6️⃣ Testing frontend accessibility...');
    const frontendResponse = await axios.get(FRONTEND_HOST);
    console.log('✅ Frontend is accessible');
    console.log('   🌐 Status:', frontendResponse.status);
    console.log('   📄 Content type:', frontendResponse.headers['content-type']);

    console.log('\n🎉 All frontend workflow tests passed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Admin authentication working');
    console.log('   ✅ Product CRUD operations working');
    console.log('   ✅ FormData submission working');
    console.log('   ✅ Authorization middleware working');
    console.log('   ✅ Frontend accessible');
    console.log('\n🚀 The frontend admin interface should work correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   📊 Status:', error.response.status);
      console.error('   📝 Data:', error.response.data);
    }
    process.exit(1);
  }
}

testFrontendWorkflow();
