const axios = require('axios');

// Docker service URLs based on docker-compose.dev.yml
const SERVICE_URLS = {
  user: 'http://localhost:3000',
  product: 'http://localhost:3001', 
  order: 'http://localhost:3002',
  payment: 'http://localhost:3003',
  apiGateway: 'http://localhost:4000',
  frontend: 'http://localhost:3005'
};

async function testServices() {
  console.log('🔍 Testing all Docker services...\n');

  // Test each service health endpoint
  for (const [serviceName, url] of Object.entries(SERVICE_URLS)) {
    try {
      const response = await axios.get(`${url}/api/health`, { timeout: 5000 });
      console.log(`✅ ${serviceName.toUpperCase()} Service: ${response.status} - ${response.data.message || 'OK'}`);
    } catch (error) {
      console.log(`❌ ${serviceName.toUpperCase()} Service: ${error.message}`);
    }
  }

  console.log('\n🧪 Testing Product Service specific endpoints...');
  
  // Test Product service endpoints
  try {
    const productsResponse = await axios.get(`${SERVICE_URLS.product}/api/products`);
    console.log(`✅ Product List: ${productsResponse.status} - Found ${productsResponse.data.length} products`);
  } catch (error) {
    console.log(`❌ Product List: ${error.response?.status || error.message}`);
  }

  console.log('\n🧪 Testing Order Service specific endpoints...');
  
  // Test Order service endpoints  
  try {
    const ordersResponse = await axios.get(`${SERVICE_URLS.order}/api/orders/health`);
    console.log(`✅ Order Health: ${ordersResponse.status} - ${ordersResponse.data.message || 'OK'}`);
  } catch (error) {
    console.log(`❌ Order Health: ${error.response?.status || error.message}`);
  }
}

async function testCODFlow() {
  console.log('\n💰 Testing Cash on Delivery (COD) Flow...\n');
  
  try {
    // 1. First, let's create a test user account
    const userData = {
      name: 'Test User',
      email: 'testuser@test.com', 
      password: 'testpass123',
      gender: 'Nam',
      age: 25
    };

    console.log('👤 Creating test user...');
    const userResponse = await axios.post(`${SERVICE_URLS.user}/api/users/signup`, userData);
    console.log(`✅ User created: ${userResponse.status}`);
    
    // Extract session cookie
    const cookies = userResponse.headers['set-cookie'];
    const sessionCookie = cookies ? cookies.find(cookie => cookie.startsWith('session=')) : null;
    
    if (!sessionCookie) {
      console.log('❌ No session cookie received');
      return;
    }

    console.log('🍪 Session cookie obtained');

    // 2. Create a test product
    const productData = {
      title: 'Test COD Product',
      price: 100000,
      qty: 5,
      description: 'Product for COD testing',
      brand: 'Apple',
      category: 'Điện thoại',
      images: {
        image1: 'https://example.com/image1.jpg'
      },
      userId: 'test-user-id'
    };

    console.log('📱 Creating test product...');
    const productResponse = await axios.post(`${SERVICE_URLS.product}/api/products`, productData, {
      headers: { Cookie: sessionCookie }
    });
    console.log(`✅ Product created: ${productResponse.status} - ID: ${productResponse.data.id}`);
    
    const productId = productResponse.data.id;

    // 3. Test inventory reservation
    console.log('📦 Testing inventory reservation...');
    const reserveData = { qty: 2 };
    const reserveResponse = await axios.post(`${SERVICE_URLS.product}/api/products/${productId}/reserve`, reserveData, {
      headers: { Cookie: sessionCookie }
    });
    console.log(`✅ Inventory reserved: ${reserveResponse.status}`);

    // 4. Create COD order
    console.log('🛒 Creating COD order...');
    const orderData = {
      cart: [{
        productId: productId,
        qty: 2,
        title: 'Test COD Product',
        price: 100000,
        discount: 0
      }],
      shippingAddress: {
        street: '123 Test Street',
        city: 'Test City',
        postalCode: '12345'
      },
      paymentMethod: 'COD'
    };

    const orderResponse = await axios.post(`${SERVICE_URLS.order}/api/orders`, orderData, {
      headers: { Cookie: sessionCookie }
    });
    console.log(`✅ COD Order created: ${orderResponse.status} - ID: ${orderResponse.data.id}`);

    console.log('\n✅ COD Flow test completed successfully!');

  } catch (error) {
    console.log(`❌ COD Flow test failed: ${error.response?.status || error.message}`);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
  }
}

// Run tests
testServices().then(() => {
  return testCODFlow();
}).catch(console.error);
