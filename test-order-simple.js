const axios = require('axios');

async function testOrder() {
    try {
        console.log('🧪 Testing Order Service...');
        
        // First, let's test the health endpoint
        try {
            const healthCheck = await axios.get('http://localhost:3002/health');
            console.log('✅ Health check:', healthCheck.data);
        } catch (error) {
            console.log('❌ Health check failed:', error.response?.data || error.message);
        }
        
        // Login to get authentication token
        let sessionCookie = '';
        try {
            console.log('🔐 Authenticating...');
            const loginResponse = await axios.post('http://localhost:3000/api/users/signin', {
                email: 'testuser@example.com',
                password: 'password123'
            });
            
            // Extract session cookie from response headers
            const cookies = loginResponse.headers['set-cookie'];
            if (cookies && cookies.length > 0) {
                sessionCookie = cookies[0].split(';')[0]; // Get the session cookie
                console.log('✅ Authenticated successfully with session cookie');
            } else {
                console.log('❌ No session cookie received');
                return;
            }
        } catch (error) {
            console.log('❌ Authentication failed:', error.response?.data || error.message);
            // Try to register if login fails
            try {
                await axios.post('http://localhost:3000/api/users/signup', {
                    email: 'testuser@example.com',
                    password: 'password123',
                    name: 'Test User',
                    gender: 'other',
                    age: 25
                });
                console.log('✅ User registered, trying login again...');
                const retryResponse = await axios.post('http://localhost:3000/api/users/signin', {
                    email: 'testuser@example.com',
                    password: 'password123'
                });
                
                const cookies = retryResponse.headers['set-cookie'];
                if (cookies && cookies.length > 0) {
                    sessionCookie = cookies[0].split(';')[0];
                    console.log('✅ Authenticated successfully after registration');
                } else {
                    console.log('❌ No session cookie received after registration');
                    return;
                }
            } catch (regError) {
                console.log('❌ Registration/login failed:', regError.response?.data || regError.message);
                return;
            }
        }
        
        // Test the order service test route first
        try {
            console.log('🧪 Testing order service test route...');
            const testResponse = await axios.post('http://localhost:3002/api/orders/test', {
                test: 'data'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': sessionCookie
                }
            });
            console.log('✅ Test route response:', testResponse.data);
        } catch (error) {
            console.log('❌ Test route failed:', error.response?.status, error.response?.data || error.message);
        }
        
        // Create a test product first
        let productId = '';
        try {
            console.log('📦 Creating test product...');
            const productResponse = await axios.post('http://localhost:3001/api/products', {
                title: 'Test Product - Simple Order',
                price: 100,
                brand: 'Apple',
                category: 'smartphone',
                description: 'Product for testing simple order',
                countInStock: 5
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': sessionCookie
                }
            });
            
            productId = productResponse.data._id || productResponse.data.id;
            console.log('✅ Test product created with ID:', productId);
            console.log('📦 Product response:', productResponse.data);
        } catch (error) {
            console.log('❌ Product creation failed:', error.response?.status, error.response?.data || error.message);
            return;
        }
        
        // Test order creation with auth
        try {
            const orderData = {
                cart: [
                    {
                        productId: productId,
                        qty: 1,
                        price: 100,
                        discount: 1,
                        title: "Test Product - Simple Order"
                    }
                ],
                shippingAddress: {
                    street: "123 Test St",
                    city: "Test City",
                    postalCode: "12345",
                    country: "Test Country"
                },
                paymentMethod: "cod",
                totalAmount: 100
            };
            
            const response = await axios.post('http://localhost:3002/api/orders', orderData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': sessionCookie
                }
            });
            
            console.log('✅ Order created:', response.data);
        } catch (error) {
            console.log('❌ Order creation failed:', error.response?.status, error.response?.data || error.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testOrder();
