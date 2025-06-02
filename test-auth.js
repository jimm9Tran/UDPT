const axios = require('axios');

async function testAuth() {
  try {
    console.log('Testing authentication with product API...');
    
    // 1. First, try to login and get a token
    const loginData = {
      email: 'admin@example.com',
      password: 'admin123'
    };
    
    console.log('1. Attempting to login...');
    const loginResponse = await axios.post('http://localhost:3000/api/users/signin', loginData);
    
    if (loginResponse.status === 200) {
      console.log('✅ Login successful');
      console.log('User:', loginResponse.data.currentUser);
      
      // Extract the session cookie
      const sessionCookie = loginResponse.headers['set-cookie']?.[0];
      console.log('Session cookie:', sessionCookie);
      
      if (sessionCookie) {
        // 2. Test creating a product with authentication
        console.log('\n2. Testing product creation with auth...');
        
        const productData = {
          title: 'Test Product with Auth',
          price: 999999,
          brand: 'TestBrand',
          category: 'smartphone',
          description: 'Test product created with proper auth',
          countInStock: 10
        };
        
        const productResponse = await axios.post(
          'http://localhost:3001/api/products',
          productData,
          {
            headers: {
              'Cookie': sessionCookie,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('✅ Product creation successful');
        console.log('Product ID:', productResponse.data.id);
        
      } else {
        console.log('❌ No session cookie found in login response');
      }
      
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    if (error.response?.status) {
      console.log('Status:', error.response.status);
    }
  }
}

testAuth();
