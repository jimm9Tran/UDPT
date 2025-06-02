const http = require('http');

// Test admin product creation with correct credentials
async function testAdminProductCreation() {
  console.log('🧪 Testing admin product creation with correct credentials...\n');

  // Step 1: Login as admin with correct password
  const loginData = JSON.stringify({
    email: 'admin@test.com',
    password: 'admin123'  // Correct password
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
    console.log('📝 Step 1: Logging in as admin with correct credentials...');
    
    const loginReq = http.request(loginOptions, (loginRes) => {
      let loginBody = '';
      
      loginRes.on('data', (chunk) => {
        loginBody += chunk;
      });
      
      loginRes.on('end', () => {
        console.log(`Login Status: ${loginRes.statusCode}`);
        
        if (loginRes.statusCode !== 200) {
          console.log('❌ Login failed');
          console.log(`Response: ${loginBody}`);
          resolve();
          return;
        }

        console.log('✅ Login successful!');
        const user = JSON.parse(loginBody);
        console.log(`User: ${user.user.name} (Admin: ${user.user.isAdmin})`);

        // Extract cookies from login response
        const cookies = loginRes.headers['set-cookie'];
        
        if (!cookies) {
          console.log('❌ No cookies received from login');
          resolve();
          return;
        }

        // Step 2: Test product creation with admin auth
        console.log('\n📝 Step 2: Testing product creation with admin auth...');
        
        const productData = JSON.stringify({
          title: 'Test Admin Product - Auth Fixed',
          price: 299.99,
          brand: 'AdminBrand',
          category: 'smartphone',
          description: 'Test product created by authenticated admin',
          countInStock: 25,
          tags: ['test', 'admin', 'auth-fixed'],
          features: ['High Quality', 'Admin Created', 'Authentication Working']
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
              console.log('✅ SUCCESS! Product created successfully with admin auth!');
              
              // Step 3: Test product update
              const createdProduct = JSON.parse(productBody);
              if (createdProduct.id) {
                console.log('\n📝 Step 3: Testing product update...');
                testProductUpdate(createdProduct.id, cookies);
              }
            } else {
              console.log('❌ Product creation failed');
              if (productRes.statusCode === 401) {
                console.log('🔍 Authentication issue detected');
              } else if (productRes.statusCode === 403) {
                console.log('🔍 Authorization issue - user might not be admin');
              }
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

// Test product update
function testProductUpdate(productId, cookies) {
  const updateData = JSON.stringify({
    title: 'Updated Test Admin Product',
    price: 349.99,
    description: 'Updated by authenticated admin'
  });

  const updateOptions = {
    hostname: 'localhost',
    port: 3001,
    path: `/api/products/${productId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(updateData),
      'Cookie': cookies.join('; ')
    }
  };

  const updateReq = http.request(updateOptions, (updateRes) => {
    let updateBody = '';
    
    updateRes.on('data', (chunk) => {
      updateBody += chunk;
    });
    
    updateRes.on('end', () => {
      console.log(`Product Update Status: ${updateRes.statusCode}`);
      console.log(`Product Update Response: ${updateBody}`);
      
      if (updateRes.statusCode === 200) {
        console.log('✅ Product updated successfully!');
      } else {
        console.log('❌ Product update failed');
      }
    });
  });

  updateReq.on('error', (err) => {
    console.error('❌ Update request error:', err.message);
  });

  updateReq.write(updateData);
  updateReq.end();
}

// Run the test
testAdminProductCreation().then(() => {
  console.log('\n🏁 Test completed');
});
