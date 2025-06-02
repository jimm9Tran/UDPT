const axios = require('axios');

const ORDER_SERVICE_URL = 'http://localhost:3003';

async function testOrderCreationBypass() {
  console.log('🧪 Testing Order Creation with Authentication Bypass...');
  
  try {
    // First test the health check
    const healthResponse = await axios.get(`${ORDER_SERVICE_URL}/api/orders/health`);
    console.log('✅ Order service health:', healthResponse.data);
    
    // Test order creation with a test product
    const testOrderData = {
      cart: [
        {
          productId: '683cfdaaa8665b1cb6e2665b', // Using one of the test products from the list
          qty: 1,
          price: 299.99,
          discount: 1 // No discount
        }
      ],
      shippingAddress: '123 Test St, Test City, Test Country',
      paymentMethod: 'creditcard'
    };
    
    console.log('📋 Testing order creation with test route...');
    console.log('📦 Test order data:', JSON.stringify(testOrderData, null, 2));
    
    const orderResponse = await axios.post(`${ORDER_SERVICE_URL}/api/orders/test-create`, testOrderData);
    
    console.log('✅ Order creation test successful!');
    console.log('📋 Response status:', orderResponse.status);
    console.log('📋 Response data:', JSON.stringify(orderResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Order creation test failed');
    if (error.response) {
      console.log('❌ Response status:', error.response.status);
      console.log('❌ Response data:', error.response.data);
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testOrderCreationBypass();
