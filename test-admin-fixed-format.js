const http = require('http');

// Test admin product creation with correct data format
async function testAdminProductCreationFixed() {
  console.log('🧪 Testing admin product creation with correct data format...\n');

  // Step 1: Login as admin
  const loginData = JSON.stringify({
    email: 'admin@test.com',
    password: 'admin123'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 3001,  // User service port
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
        if (loginRes.statusCode !== 200) {
          console.log('❌ Login failed');
          resolve();
          return;
        }

        console.log('✅ Login successful!');
        const cookies = loginRes.headers['set-cookie'];
        
        // Step 2: Test product creation with correct format
        console.log('\n📝 Step 2: Testing product creation with correct format...');
        
        const productData = JSON.stringify({
          title: 'Test Admin Product - Fixed Format',
          price: 299.99,
          brand: 'Apple',
          category: 'smartphone',  // Valid category
          description: 'Test product created by authenticated admin with correct format',
          countInStock: 25,  // Integer as required
          tags: ['test', 'admin', 'auth-fixed'],  // Array format
          features: ['High Quality', 'Admin Created', 'Authentication Working']  // Array format
        });

        const productOptions = {
          hostname: 'localhost',
          port: 3002,  // Product service port
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
              console.log('🎉 SUCCESS! Product created successfully!');
              
              // Test with FormData format too
              console.log('\n📝 Step 3: Testing with FormData format...');
              testFormDataCreation(cookies);
            } else {
              console.log('❌ Product creation failed');
              
              // Try to parse and show specific errors
              try {
                const errorResponse = JSON.parse(productBody);
                if (errorResponse.errors) {
                  console.log('Validation errors:');
                  errorResponse.errors.forEach(error => {
                    console.log(`  - ${error.message}`);
                  });
                }
              } catch (e) {
                console.log('Could not parse error response');
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

// Test FormData creation
function testFormDataCreation(cookies) {
  const FormData = require('form-data');
  const form = new FormData();
  
  form.append('title', 'Test Admin Product - FormData');
  form.append('price', '399.99');
  form.append('brand', 'Samsung');
  form.append('category', 'smartphone');
  form.append('description', 'Test product via FormData');
  form.append('countInStock', '30');
  form.append('tags', JSON.stringify(['formdata', 'test']));
  form.append('features', JSON.stringify(['FormData Support', 'Working Auth']));

  const formOptions = {
    hostname: 'localhost',
    port: 3002,  // Product service port
    path: '/api/products',
    method: 'POST',
    headers: {
      ...form.getHeaders(),
      'Cookie': cookies.join('; ')
    }
  };

  const formReq = http.request(formOptions, (formRes) => {
    let formBody = '';
    
    formRes.on('data', (chunk) => {
      formBody += chunk;
    });
    
    formRes.on('end', () => {
      console.log(`FormData Creation Status: ${formRes.statusCode}`);
      console.log(`FormData Creation Response: ${formBody}`);
      
      if (formRes.statusCode === 201) {
        console.log('🎉 SUCCESS! FormData product created successfully!');
      } else {
        console.log('❌ FormData product creation failed');
      }
    });
  });

  formReq.on('error', (err) => {
    console.error('❌ FormData request error:', err.message);
  });

  form.pipe(formReq);
}

// Run the test
testAdminProductCreationFixed().then(() => {
  console.log('\n🏁 Test completed');
});
