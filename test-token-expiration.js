const axios = require('axios');

async function testTokenExpiration() {
  try {
    console.log('🔐 Testing Token Expiration Issue...\n');
    
    // Step 1: Login to get token
    console.log('1. 🔓 Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:4000/api/users/signin', {
      email: 'admin@test.com',
      password: 'admin123'
    }, {
      withCredentials: true
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('🎫 Token received:', token.substring(0, 50) + '...');
    
    // Step 2: Immediately test the token
    console.log('\n2. 🧪 Testing token immediately...');
    const immediateTest = await axios.get('http://localhost:4000/api/users/currentuser', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
    console.log('✅ Token works immediately:', immediateTest.data.currentUser?.email);
    
    // Step 3: Test after a few seconds
    console.log('\n3. ⏱️ Waiting 5 seconds then testing...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const delayedTest = await axios.get('http://localhost:4000/api/users/currentuser', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
    console.log('✅ Token still works after 5 seconds:', delayedTest.data.currentUser?.email);
    
    // Step 4: Test creating a product
    console.log('\n4. 📦 Testing product creation with token...');
    const productData = {
      name: 'Token Test Product',
      description: 'Testing token persistence',
      price: 99.99,
      countInStock: 10,
      category: 'Electronics',
      brand: 'Apple',
      features: ['Test feature'],
      tags: ['test'],
      inTheBox: ['Test item']
    };
    
    const productResponse = await axios.post('http://localhost:4000/api/products', productData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    console.log('✅ Product created successfully:', productResponse.data.name);
    
    // Step 5: Wait longer and test again
    console.log('\n5. ⏳ Waiting 30 seconds then testing...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    const longDelayedTest = await axios.get('http://localhost:4000/api/users/currentuser', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
    console.log('✅ Token still works after 30 seconds:', longDelayedTest.data.currentUser?.email);
    
    console.log('\n🎉 Token expiration test completed - tokens appear to be persistent!');
    
  } catch (error) {
    console.error('\n❌ Error during token test:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Data:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.error('\n🚨 TOKEN EXPIRATION CONFIRMED - This is the issue!');
    }
  }
}

testTokenExpiration();
