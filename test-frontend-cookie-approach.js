// Test frontend cookie approach
const axios = require('axios');

const API_BASE_URL = 'http://localhost:4000/api';

async function testFrontendCookieApproach() {
  console.log('🧪 Testing Frontend Cookie Approach...\n');
  
  try {
    // Step 1: Login to get token
    console.log('1. 🔓 Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/users/signin`, {
      email: 'admin@test.com',
      password: 'admin123'
    }, {
      withCredentials: true
    });
    
    const { token } = loginResponse.data;
    console.log('✅ Login successful');
    console.log(`🎫 Token: ${token.substring(0, 50)}...`);
    
    // Step 2: Test with cookie (như frontend sẽ gửi)
    console.log('\n2. 🍪 Testing with cookie format...');
    
    // Simulate what frontend will send
    const cookieHeader = `session=${JSON.stringify({ jwt: token })}`;
    
    const productResponse = await axios.post(`${API_BASE_URL}/products`, {
      name: 'Cookie Test Product',
      description: 'Test with cookie authentication',
      price: 99,
      categoryId: '507f1f77bcf86cd799439011',
      brand: 'Apple',
      countInStock: 10,
      features: ['Feature 1'],
      tags: ['Tag 1'],
      inTheBox: ['Item 1']
    }, {
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    console.log('✅ Product creation with cookie successful!');
    console.log(`📦 Product ID: ${productResponse.data.id}`);
    console.log(`📝 Product Name: ${productResponse.data.name}`);
    
  } catch (error) {
    console.log('❌ Cookie approach failed:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    
    if (error.response?.status === 502) {
      console.log('   🚨 Service is down - need to restart backend services');
    }
  }
}

testFrontendCookieApproach();
