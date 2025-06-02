const axios = require('axios');

async function testExistingAdmin() {
  try {
    console.log('Testing with existing admin user...');
    
    // Try to login with existing admin
    const loginData = {
      email: 'admin@test.com',
      password: 'password123'
    };
    
    console.log('1. Attempting to login...');
    const loginResponse = await axios.post('http://localhost:3000/api/users/signin', loginData);
    
    if (loginResponse.status === 200) {
      console.log('✅ Login successful');
      console.log('User:', loginResponse.data.currentUser);
      
      // Extract the session cookie
      const sessionCookie = loginResponse.headers['set-cookie']?.[0];
      console.log('Session cookie:', sessionCookie?.substring(0, 50) + '...');
      
      if (sessionCookie) {
        // Test creating a product with authentication
        console.log('\n2. Testing product creation with auth...');
        
        const productData = {
          title: 'Test Product with Auth - ' + new Date().toISOString(),
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
        
        // Test getting all products (no auth required)
        console.log('\n3. Testing get all products...');
        const getAllResponse = await axios.get('http://localhost:3001/api/products');
        console.log(`✅ Got ${getAllResponse.data.length} products`);
        
        // Test updating the created product
        console.log('\n4. Testing product update...');
        const updateData = {
          title: 'Updated Test Product - ' + new Date().toISOString(),
          price: 1199999,
          description: 'Updated description'
        };
        
        const updateResponse = await axios.put(
          `http://localhost:3001/api/products/${productResponse.data.id}`,
          updateData,
          {
            headers: {
              'Cookie': sessionCookie,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('✅ Product update successful');
        console.log('Updated product:', updateResponse.data.title);
        
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
    if (error.response?.headers) {
      console.log('Response headers:', error.response.headers);
    }
  }
}

testExistingAdmin();
