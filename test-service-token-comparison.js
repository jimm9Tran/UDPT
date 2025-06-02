const axios = require('axios');

async function testServiceTokenComparison() {
  try {
    console.log('🔍 Comparing Token Validation Between Services...\n');
    
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
    console.log('🎫 Token received (first 50 chars):', token.substring(0, 50) + '...');
    
    // Step 2: Test User Service (/api/users/currentuser)
    console.log('\n2. 🧪 Testing User Service token validation...');
    try {
      const userResponse = await axios.get('http://localhost:4000/api/users/currentuser', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      console.log('✅ User Service: Token accepted');
      console.log('   Current User:', userResponse.data.currentUser?.email, '| Admin:', userResponse.data.currentUser?.isAdmin);
    } catch (error) {
      console.log('❌ User Service: Token rejected');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
    }
    
    // Step 3: Test Product Service (/api/products with Authorization header)
    console.log('\n3. 🧪 Testing Product Service token validation...');
    try {
      const productData = {
        title: 'Token Test Product',
        description: 'Testing token validation between services',
        price: 99.99,
        countInStock: 10,
        category: 'electronics',
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
      console.log('✅ Product Service: Token accepted');
      console.log('   Product created:', productResponse.data.title);
    } catch (error) {
      console.log('❌ Product Service: Token rejected');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Full Error Data:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // Step 4: Test Order Service
    console.log('\n4. 🧪 Testing Order Service token validation...');
    try {
      const orderResponse = await axios.get('http://localhost:4000/api/orders/myorders', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      console.log('✅ Order Service: Token accepted');
      console.log('   Orders count:', orderResponse.data.length);
    } catch (error) {
      console.log('❌ Order Service: Token rejected');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
    }
    
    // Step 5: Test Payment Service
    console.log('\n5. 🧪 Testing Payment Service token validation...');
    try {
      const paymentResponse = await axios.get('http://localhost:4000/api/payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      console.log('✅ Payment Service: Token accepted');
    } catch (error) {
      console.log('❌ Payment Service: Token rejected');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
    }
    
    // Step 6: Decode the JWT to inspect its structure
    console.log('\n6. 🔍 JWT Token Analysis...');
    const base64Payload = token.split('.')[1];
    const decodedPayload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    console.log('JWT Payload:', JSON.stringify(decodedPayload, null, 2));
    
    // Check token expiration
    if (decodedPayload.exp) {
      const expirationDate = new Date(decodedPayload.exp * 1000);
      const now = new Date();
      console.log('Token expires at:', expirationDate.toISOString());
      console.log('Current time:', now.toISOString());
      console.log('Time until expiration:', Math.round((expirationDate - now) / 1000 / 60), 'minutes');
    } else {
      console.log('⚠️ Token has no expiration time');
    }
    
  } catch (error) {
    console.error('\n❌ Error during service comparison test:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Data:', error.response?.data);
  }
}

testServiceTokenComparison();
