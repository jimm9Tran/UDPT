const http = require('http');

// Test admin authentication and product creation
async function testAdminAuth() {
  console.log('🧪 Testing admin authentication and product creation...\n');

  // Step 1: Login as admin
  const loginData = JSON.stringify({
    email: 'admin@test.com',
    password: 'password123'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/signin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  return new Promise((resolve, reject) => {
    console.log('📝 Step 1: Logging in as admin...');
    
    const loginReq = http.request(loginOptions, (loginRes) => {
      let loginBody = '';
      
      loginRes.on('data', (chunk) => {
        loginBody += chunk;
      });
      
      loginRes.on('end', () => {
        console.log(`Login Status: ${loginRes.statusCode}`);
        console.log(`Login Response: ${loginBody}`);
        
        if (loginRes.statusCode !== 200) {
          console.log('❌ Login failed');
          resolve();
          return;
        }

        // Extract cookies from login response
        const cookies = loginRes.headers['set-cookie'];
        console.log(`Cookies received: ${cookies}`);
        
        if (!cookies) {
          console.log('❌ No cookies received from login');
          resolve();
          return;
        }

        // Step 2: Test product creation with admin auth
        console.log('\n📝 Step 2: Testing product creation with admin auth...');
        
        const productData = JSON.stringify({
          title: 'Test Admin Product',
          price: 99.99,
          brand: 'TestBrand',
          category: 'smartphone',
          description: 'Test product created by admin',
          countInStock: 10
        });

        const productOptions = {
          hostname: 'localhost',
          port: 3001,
          path: '/api/products',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(productData),
            'Cookie': cookies.join('; ')
          }
        };

        const productReq = http.request(productOptions, (productRes) => {
          let productBody = '';
          
          productRes.on('data', (chunk) => {
            productBody += chunk;
          });
          
          productRes.on('end', () => {
            console.log(`Product Creation Status: ${productRes.statusCode}`);
            console.log(`Product Creation Response: ${productBody}`);
            
            if (productRes.statusCode === 201) {
              console.log('✅ Product created successfully with admin auth!');
            } else {
              console.log('❌ Product creation failed');
            }
            
            resolve();
          });
        });

        productReq.on('error', (err) => {
          console.error('❌ Product request error:', err.message);
          resolve();
        });

        productReq.write(productData);
        productReq.end();
      });
    });

    loginReq.on('error', (err) => {
      console.error('❌ Login request error:', err.message);
      resolve();
    });

    loginReq.write(loginData);
    loginReq.end();
  });
}

// Run the test
testAdminAuth().then(() => {
  console.log('\n🏁 Test completed');
});
