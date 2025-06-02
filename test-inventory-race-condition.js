// Test script to verify inventory management and race condition protection
const axios = require('axios');

// Configuration
const USER_API_BASE = 'http://localhost:3000'; // User service
const PRODUCT_API_BASE = 'http://localhost:4002'; // Product service (updated)
const ORDER_API_BASE = 'http://localhost:3002'; // Order service
const PAYMENT_API_BASE = 'http://localhost:3003'; // Payment service

// Test data
const testProduct = {
  title: 'Test Product - Race Condition',
  price: 100000,
  brand: 'Apple',
  category: 'smartphone',
  description: 'Product for testing race conditions',
  countInStock: 1, // Only 1 item in stock
  userId: 'test-user-id',
  images: {
    image1: 'https://example.com/test-product.jpg'
  }
};

const testUser = {
  email: 'testuser@example.com',
  password: 'password123',
  name: 'Test User',
  gender: 'other',
  age: 25
};

let authCookie = '';
let productId = '';

// Helper functions
async function login() {
  try {
    const response = await axios.post(`${USER_API_BASE}/api/users/signin`, {
      email: testUser.email,
      password: testUser.password
    });
    
    const cookie = response.headers['set-cookie']?.[0];
    if (cookie) {
      authCookie = cookie.split(';')[0];
      console.log('✅ Logged in successfully');
      return true;
    }
  } catch (error) {
    // Try to register if login fails
    try {
      await axios.post(`${USER_API_BASE}/api/users/signup`, testUser);
      console.log('✅ User registered');
      return await login();
    } catch (regError) {
      console.error('❌ Failed to login/register:', regError.response?.data?.message || regError.message);
      return false;
    }
  }
}

async function createTestProduct() {
  try {
    const response = await axios.post(`${PRODUCT_API_BASE}/api/products`, testProduct, {
      headers: {
        'Cookie': authCookie,
        'Content-Type': 'application/json'
      }
    });
    
    productId = response.data.id;
    console.log(`✅ Test product created with ID: ${productId}`);
    console.log(`📦 Stock: ${response.data.countInStock}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to create product:', error.response?.data?.message || error.message);
    return false;
  }
}

async function getCurrentStock() {
  try {
    const response = await axios.get(`${PRODUCT_API_BASE}/api/products/${productId}`);
    return response.data.countInStock;
  } catch (error) {
    console.error('❌ Failed to get current stock:', error.response?.data?.message || error.message);
    return null;
  }
}

async function attemptOrder(userId = 'user1') {
  try {
    console.log(`🛒 ${userId} attempting to order...`);
    
    // Check stock first
    const currentStock = await getCurrentStock();
    console.log(`📦 Current stock before order: ${currentStock}`);
    
    // Create order
    const orderData = {
      cart: [{
        productId: productId,
        qty: 1,
        price: testProduct.price,
        discount: 1,
        title: testProduct.title
      }],
      shippingAddress: {
        street: '123 Test Street',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country'
      },
      paymentMethod: 'cod'
    };

    const orderResponse = await axios.post(`${ORDER_API_BASE}/api/orders`, orderData, {
      headers: {
        'Cookie': authCookie,
        'Content-Type': 'application/json'
      }
    });

    const orderId = orderResponse.data.id;
    console.log(`✅ ${userId} order created: ${orderId}`);

    // Check stock after order
    const stockAfterOrder = await getCurrentStock();
    console.log(`📦 Stock after ${userId} order: ${stockAfterOrder}`);

    // Create COD payment
    const paymentData = {
      amount: testProduct.price
    };

    const paymentResponse = await axios.post(`${PAYMENT_API_BASE}/api/payments/cod`, {
      orderId: orderId,
      amount: testProduct.price,
      deliveryAddress: '123 Test Street, Test City',
      phoneNumber: '0123456789'
    }, {
      headers: {
        'Cookie': authCookie,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ ${userId} COD payment created: ${paymentResponse.data.id}`);
    return { success: true, orderId, paymentId: paymentResponse.data.id };

  } catch (error) {
    const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || error.message;
    const statusCode = error.response?.status;
    const errorData = error.response?.data;
    console.log(`❌ ${userId} order failed: ${errorMessage} (Status: ${statusCode})`);
    if (errorData) {
      console.log(`   Error details:`, JSON.stringify(errorData, null, 2));
    }
    return { success: false, error: errorMessage };
  }
}

async function testRaceCondition() {
  console.log('\n🏁 Testing Race Condition with 3 concurrent orders for 1 item...\n');
  
  // Launch 3 concurrent orders
  const promises = [
    attemptOrder('User1'),
    attemptOrder('User2'), 
    attemptOrder('User3')
  ];

  const results = await Promise.allSettled(promises);
  
  console.log('\n📊 Results Summary:');
  let successCount = 0;
  let failCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      if (result.value.success) {
        successCount++;
        console.log(`✅ User${index + 1}: SUCCESS - Order: ${result.value.orderId}`);
      } else {
        failCount++;
        console.log(`❌ User${index + 1}: FAILED - ${result.value.error}`);
      }
    } else {
      failCount++;
      console.log(`❌ User${index + 1}: ERROR - ${result.reason}`);
    }
  });

  console.log(`\n📈 Final Stats:`);
  console.log(`   ✅ Successful orders: ${successCount}`);
  console.log(`   ❌ Failed orders: ${failCount}`);
  
  const finalStock = await getCurrentStock();
  console.log(`   📦 Final stock: ${finalStock}`);
  
  // Validate results
  if (successCount === 1 && failCount === 2 && finalStock === 0) {
    console.log('\n🎉 RACE CONDITION TEST PASSED! Only 1 order succeeded as expected.');
  } else {
    console.log('\n⚠️ RACE CONDITION TEST FAILED! Multiple orders may have succeeded.');
  }
}

async function cleanup() {
  try {
    if (productId) {
      await axios.delete(`${PRODUCT_API_BASE}/api/products/${productId}`, {
        headers: {
          'Cookie': authCookie
        }
      });
      console.log('🧹 Test product cleaned up');
    }
  } catch (error) {
    console.log('⚠️ Failed to cleanup test product');
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting Inventory Race Condition Tests\n');
  
  try {
    // Setup
    if (!await login()) {
      console.log('❌ Failed to authenticate, stopping tests');
      return;
    }
    
    if (!await createTestProduct()) {
      console.log('❌ Failed to create test product, stopping tests');
      return;
    }

    // Run race condition test
    await testRaceCondition();
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  } finally {
    // Cleanup
    await cleanup();
  }
}

// Add graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted, cleaning up...');
  await cleanup();
  process.exit(0);
});

// Run the tests
runTests().catch(console.error);
