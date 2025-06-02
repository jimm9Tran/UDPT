const axios = require('axios');

async function setupAdminUser() {
  try {
    console.log('Setting up admin user...');
    
    // 1. First, try to register an admin user
    const registerData = {
      email: 'admin@test.com',
      password: 'password123',
      name: 'Admin User',
      gender: 'male',
      age: 30,
      isAdmin: true
    };
    
    console.log('1. Attempting to register admin user...');
    
    try {
      const registerResponse = await axios.post('http://localhost:3000/api/users/signup', registerData);
      console.log('✅ Admin user registered successfully');
      console.log('User:', registerResponse.data.currentUser);
    } catch (registerError) {
      if (registerError.response?.status === 400 && registerError.response?.data?.errors?.some(e => e.message.includes('Email in use'))) {
        console.log('ℹ️ Admin user already exists, proceeding to login...');
      } else {
        console.log('❌ Registration failed:', registerError.response?.data || registerError.message);
        return;
      }
    }
    
    // 2. Now try to login
    const loginData = {
      email: 'admin@test.com',
      password: 'password123'
    };
    
    console.log('\n2. Attempting to login...');
    const loginResponse = await axios.post('http://localhost:3000/api/users/signin', loginData);
    
    if (loginResponse.status === 200) {
      console.log('✅ Login successful');
      console.log('User:', loginResponse.data.currentUser);
      
      // Extract the session cookie
      const sessionCookie = loginResponse.headers['set-cookie']?.[0];
      console.log('Session cookie:', sessionCookie);
      
      if (sessionCookie) {
        // 3. Test creating a product with authentication
        console.log('\n3. Testing product creation with auth...');
        
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
        
        // 4. Test getting all products (no auth required)
        console.log('\n4. Testing get all products...');
        const getAllResponse = await axios.get('http://localhost:3001/api/products');
        console.log(`✅ Got ${getAllResponse.data.length} products`);
        
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

setupAdminUser();
