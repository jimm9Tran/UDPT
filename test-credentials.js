const http = require('http');

// Test different admin credentials
async function testDifferentCredentials() {
  console.log('🧪 Testing different admin credentials...\n');

  const credentials = [
    { email: 'admin@test.com', password: 'password123' },
    { email: 'admin@test.com', password: 'admin123' },
    { email: 'admin@example.com', password: 'password123' },
    { email: 'admin@admin.com', password: 'admin' },
    { email: 'test@test.com', password: 'password' }
  ];

  for (let i = 0; i < credentials.length; i++) {
    const cred = credentials[i];
    console.log(`📝 Testing credentials ${i + 1}: ${cred.email} / ${cred.password}`);
    
    const loginData = JSON.stringify(cred);

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

    await new Promise((resolve) => {
      const loginReq = http.request(loginOptions, (loginRes) => {
        let loginBody = '';
        
        loginRes.on('data', (chunk) => {
          loginBody += chunk;
        });
        
        loginRes.on('end', () => {
          console.log(`Status: ${loginRes.statusCode}`);
          if (loginRes.statusCode === 200) {
            console.log('✅ LOGIN SUCCESS!');
            console.log(`Response: ${loginBody}`);
            const cookies = loginRes.headers['set-cookie'];
            console.log(`Cookies: ${cookies}`);
          } else {
            console.log(`❌ Failed: ${loginBody}`);
          }
          console.log('---');
          resolve();
        });
      });

      loginReq.on('error', (err) => {
        console.error(`❌ Request error: ${err.message}`);
        resolve();
      });

      loginReq.write(loginData);
      loginReq.end();
    });
  }
}

// Also try to create a new admin user
async function createAdminUser() {
  console.log('\n🔨 Trying to create a new admin user...\n');
  
  const userData = JSON.stringify({
    email: 'newadmin@test.com',
    password: 'password123',
    name: 'New Admin',
    gender: 'male',
    age: 30,
    role: 'admin'
  });

  const signupOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/signup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(userData)
    }
  };

  return new Promise((resolve) => {
    const signupReq = http.request(signupOptions, (signupRes) => {
      let signupBody = '';
      
      signupRes.on('data', (chunk) => {
        signupBody += chunk;
      });
      
      signupRes.on('end', () => {
        console.log(`Signup Status: ${signupRes.statusCode}`);
        console.log(`Signup Response: ${signupBody}`);
        
        if (signupRes.statusCode === 201) {
          console.log('✅ New admin user created successfully!');
        } else {
          console.log('❌ Failed to create admin user');
        }
        resolve();
      });
    });

    signupReq.on('error', (err) => {
      console.error(`❌ Signup error: ${err.message}`);
      resolve();
    });

    signupReq.write(userData);
    signupReq.end();
  });
}

// Run tests
async function runTests() {
  await testDifferentCredentials();
  await createAdminUser();
  console.log('\n🏁 All tests completed');
}

runTests();
