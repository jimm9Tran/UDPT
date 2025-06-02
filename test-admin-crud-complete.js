const http = require('http');

// Complete CRUD test for admin operations
async function testAdminCRUD() {
  console.log('🧪 Testing complete admin CRUD operations...\n');

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
    console.log('📝 Step 1: Admin Login...');
    
    const loginReq = http.request(loginOptions, (loginRes) => {
      let loginBody = '';
      
      loginRes.on('data', (chunk) => {
        loginBody += chunk;
      });
      
      loginRes.on('end', async () => {
        if (loginRes.statusCode !== 200) {
          console.log('❌ Admin login failed');
          resolve();
          return;
        }

        console.log('✅ Admin login successful!');
        const cookies = loginRes.headers['set-cookie'];
        
        // Step 2: Create Product
        console.log('\n📝 Step 2: Create Product...');
        const productId = await testCreateProduct(cookies);
        
        if (productId) {
          // Step 3: Read Product
          console.log('\n📝 Step 3: Read Product...');
          await testReadProduct(productId);
          
          // Step 4: Update Product
          console.log('\n📝 Step 4: Update Product...');
          await testUpdateProduct(productId, cookies);
          
          // Step 5: List All Products
          console.log('\n📝 Step 5: List All Products...');
          await testListProducts();
          
          // Step 6: Delete Product
          console.log('\n📝 Step 6: Delete Product...');
          await testDeleteProduct(productId, cookies);
          
          console.log('\n🎉 All CRUD operations completed!');
        }
        
        resolve();
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

// Test product creation
function testCreateProduct(cookies) {
  return new Promise((resolve) => {
    const productData = JSON.stringify({
      title: 'Admin CRUD Test Product',
      price: 599.99,
      originalPrice: 699.99,
      brand: 'Apple',
      category: 'smartphone',
      description: 'A complete test product for CRUD operations',
      countInStock: 50,
      tags: ['test', 'admin', 'crud'],
      features: ['High Quality', 'CRUD Test', 'Admin Created'],
      isActive: true,
      isFeatured: true
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
        if (productRes.statusCode === 201) {
          const product = JSON.parse(productBody);
          console.log(`✅ Product created successfully! ID: ${product.id}`);
          resolve(product.id);
        } else {
          console.log(`❌ Product creation failed: ${productRes.statusCode}`);
          console.log(`Response: ${productBody}`);
          resolve(null);
        }
      });
    });

    productReq.on('error', (err) => {
      console.error('❌ Product creation request error:', err.message);
      resolve(null);
    });

    productReq.write(productData);
    productReq.end();
  });
}

// Test product reading
function testReadProduct(productId) {
  return new Promise((resolve) => {
    const readOptions = {
      hostname: 'localhost',
      port: 3002,
      path: `/api/products/${productId}`,
      method: 'GET'
    };

    const readReq = http.request(readOptions, (readRes) => {
      let readBody = '';
      
      readRes.on('data', (chunk) => {
        readBody += chunk;
      });
      
      readRes.on('end', () => {
        if (readRes.statusCode === 200) {
          const product = JSON.parse(readBody);
          console.log(`✅ Product read successfully! Title: ${product.title}`);
        } else {
          console.log(`❌ Product read failed: ${readRes.statusCode}`);
        }
        resolve();
      });
    });

    readReq.on('error', (err) => {
      console.error('❌ Product read request error:', err.message);
      resolve();
    });

    readReq.end();
  });
}

// Test product update
function testUpdateProduct(productId, cookies) {
  return new Promise((resolve) => {
    const updateData = JSON.stringify({
      title: 'Updated Admin CRUD Test Product',
      price: 649.99,
      description: 'Updated description for CRUD test product',
      countInStock: 45,
      tags: ['test', 'admin', 'crud', 'updated']
    });

    const updateOptions = {
      hostname: 'localhost',
      port: 3002,
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
        if (updateRes.statusCode === 200) {
          const product = JSON.parse(updateBody);
          console.log(`✅ Product updated successfully! New title: ${product.title}`);
        } else {
          console.log(`❌ Product update failed: ${updateRes.statusCode}`);
          console.log(`Response: ${updateBody}`);
        }
        resolve();
      });
    });

    updateReq.on('error', (err) => {
      console.error('❌ Product update request error:', err.message);
      resolve();
    });

    updateReq.write(updateData);
    updateReq.end();
  });
}

// Test list all products
function testListProducts() {
  return new Promise((resolve) => {
    const listOptions = {
      hostname: 'localhost',
      port: 3002,
      path: '/api/products',
      method: 'GET'
    };

    const listReq = http.request(listOptions, (listRes) => {
      let listBody = '';
      
      listRes.on('data', (chunk) => {
        listBody += chunk;
      });
      
      listRes.on('end', () => {
        if (listRes.statusCode === 200) {
          const data = JSON.parse(listBody);
          console.log(`✅ Products listed successfully! Total: ${data.products ? data.products.length : 'Unknown'}`);
        } else {
          console.log(`❌ Product list failed: ${listRes.statusCode}`);
        }
        resolve();
      });
    });

    listReq.on('error', (err) => {
      console.error('❌ Product list request error:', err.message);
      resolve();
    });

    listReq.end();
  });
}

// Test product deletion
function testDeleteProduct(productId, cookies) {
  return new Promise((resolve) => {
    const deleteOptions = {
      hostname: 'localhost',
      port: 3002,
      path: `/api/products/${productId}`,
      method: 'DELETE',
      headers: {
        'Cookie': cookies.join('; ')
      }
    };

    const deleteReq = http.request(deleteOptions, (deleteRes) => {
      let deleteBody = '';
      
      deleteRes.on('data', (chunk) => {
        deleteBody += chunk;
      });
      
      deleteRes.on('end', () => {
        if (deleteRes.statusCode === 200) {
          console.log('✅ Product deleted successfully!');
        } else {
          console.log(`❌ Product deletion failed: ${deleteRes.statusCode}`);
          console.log(`Response: ${deleteBody}`);
        }
        resolve();
      });
    });

    deleteReq.on('error', (err) => {
      console.error('❌ Product deletion request error:', err.message);
      resolve();
    });

    deleteReq.end();
  });
}

// Test unauthorized access
async function testUnauthorizedAccess() {
  console.log('\n🔒 Testing unauthorized access...');
  
  const productData = JSON.stringify({
    title: 'Unauthorized Test Product',
    price: 99.99,
    brand: 'Samsung',
    category: 'smartphone',
    description: 'This should fail',
    countInStock: 10
  });

  const productOptions = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/products',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(productData)
      // No cookies = unauthorized
    }
  };

  return new Promise((resolve) => {
    const productReq = http.request(productOptions, (productRes) => {
      let productBody = '';
      
      productRes.on('data', (chunk) => {
        productBody += chunk;
      });
      
      productRes.on('end', () => {
        if (productRes.statusCode === 401) {
          console.log('✅ Unauthorized access properly blocked!');
        } else {
          console.log(`⚠️ Unexpected response for unauthorized access: ${productRes.statusCode}`);
          console.log(`Response: ${productBody}`);
        }
        resolve();
      });
    });

    productReq.on('error', (err) => {
      console.error('❌ Unauthorized test request error:', err.message);
      resolve();
    });

    productReq.write(productData);
    productReq.end();
  });
}

// Run all tests
async function runAllTests() {
  await testAdminCRUD();
  await testUnauthorizedAccess();
  console.log('\n🏁 All tests completed!');
}

runAllTests();
