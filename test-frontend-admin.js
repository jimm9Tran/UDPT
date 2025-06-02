const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testFrontendProductCreation() {
  console.log('🧪 Testing Frontend Admin Product Creation...\n');

  try {
    // Test 1: Direct API call via frontend's proxy endpoint
    console.log('📡 Test 1: Testing via frontend proxy (http://localhost:3005/api/products)');
    
    const productData = {
      title: 'Test Product via Frontend',
      price: 15000000,
      originalPrice: 18000000,
      brand: 'Samsung',
      category: 'Điện thoại', // Vietnamese category
      description: 'Test product created through frontend proxy',
      countInStock: 15,
      specifications: {
        processor: 'Snapdragon 8 Gen 2',
        ram: '8GB',
        storage: '256GB',
        display: '6.4 inch Dynamic AMOLED'
      },
      features: ['5G Ready', 'Wireless Charging'],
      tags: ['smartphone', 'samsung'],
      isActive: true,
      isFeatured: true
    };

    console.log('📤 Sending product data:', JSON.stringify(productData, null, 2));

    const frontendResponse = await axios.post(
      'http://localhost:3005/api/products',
      productData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ Frontend proxy test SUCCESS!');
    console.log('📋 Response status:', frontendResponse.status);
    console.log('📋 Response data:', JSON.stringify(frontendResponse.data, null, 2));

  } catch (error) {
    console.log('❌ Frontend proxy test FAILED!');
    console.log('🔍 Error details:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
      console.log('   Headers:', error.response.headers);
    } else if (error.request) {
      console.log('   No response received:', error.request);
    } else {
      console.log('   Error:', error.message);
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');

  try {
    // Test 2: Direct API Gateway call (how frontend should work)
    console.log('📡 Test 2: Testing via API Gateway (http://localhost:4000/api/products)');
    
    const productData2 = {
      title: 'Test Product via API Gateway',
      price: 20000000,
      originalPrice: 22000000,
      brand: 'Xiaomi',
      category: 'Laptop', // Vietnamese category
      description: 'Test product created through API Gateway',
      countInStock: 8,
      specifications: {
        processor: 'Intel i7',
        ram: '16GB',
        storage: '512GB SSD',
        display: '15.6 inch FHD'
      },
      features: ['Gaming Ready', 'Fast Charging'],
      tags: ['laptop', 'xiaomi'],
      isActive: true,
      isFeatured: false
    };

    console.log('📤 Sending product data:', JSON.stringify(productData2, null, 2));

    const gatewayResponse = await axios.post(
      'http://localhost:4000/api/products',
      productData2,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ API Gateway test SUCCESS!');
    console.log('📋 Response status:', gatewayResponse.status);
    console.log('📋 Response data:', JSON.stringify(gatewayResponse.data, null, 2));

  } catch (error) {
    console.log('❌ API Gateway test FAILED!');
    console.log('🔍 Error details:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
      console.log('   Headers:', error.response.headers);
    } else if (error.request) {
      console.log('   No response received:', error.request);
    } else {
      console.log('   Error:', error.message);
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Check if products were created
  try {
    console.log('📡 Test 3: Fetching all products to verify creation');
    
    const productsResponse = await axios.get('http://localhost:4000/api/products');
    const productsData = productsResponse.data.products || productsResponse.data;
    console.log('✅ Product fetch SUCCESS!');
    console.log('📋 Total products:', productsData.length);
    console.log('📋 Recent products:');
    productsData.slice(-3).forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.title} (${product.category}) - ${product.price}đ`);
    });

  } catch (error) {
    console.log('❌ Product fetch FAILED!');
    console.log('🔍 Error:', error.response?.data || error.message);
  }
}

// Run the test
testFrontendProductCreation().then(() => {
  console.log('\n🏁 Frontend admin testing completed!');
}).catch((error) => {
  console.error('💥 Test script failed:', error);
});
