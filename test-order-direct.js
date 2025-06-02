const axios = require('axios');

async function testOrderDirect() {
    try {
        console.log('🧪 Testing Order Service (Direct)...');
        
        // Test health endpoint
        try {
            const healthCheck = await axios.get('http://localhost:3003/health');
            console.log('✅ Order service health:', healthCheck.data);
        } catch (error) {
            console.log('❌ Order service health check failed:', error.response?.data || error.message);
            return;
        }

        // Check product service health  
        try {
            const productHealth = await axios.get('http://localhost:3002/health');
            console.log('✅ Product service health:', productHealth.data);
        } catch (error) {
            console.log('❌ Product service health check failed:', error.response?.data || error.message);
            return;
        }

        // Create a test product first
        let productId = '';
        try {
            console.log('📦 Creating test product...');
            const productResponse = await axios.post('http://localhost:3002/api/products', {
                title: 'Test Product - Direct Order',
                price: 100,
                brand: 'Apple',
                category: 'smartphone',
                description: 'Product for testing direct order',
                countInStock: 5
            });
            
            productId = productResponse.data._id || productResponse.data.id;
            console.log('✅ Test product created with ID:', productId);
        } catch (error) {
            console.log('❌ Product creation failed:', error.response?.status, error.response?.data || error.message);
            // Let's try with a mock product ID
            productId = '507f1f77bcf86cd799439011'; // Mock MongoDB ObjectId
            console.log('🔄 Using mock product ID:', productId);
        }

        // Test inventory reservation directly
        try {
            console.log('🔄 Testing inventory reservation...');
            const reserveResponse = await axios.post('http://localhost:3002/api/products/reserve-inventory', {
                items: [
                    {
                        productId: productId,
                        quantity: 1
                    }
                ]
            });
            console.log('✅ Inventory reserved:', reserveResponse.data);
            
            // Release the reservation
            const releaseResponse = await axios.post('http://localhost:3002/api/products/release-inventory', {
                reservationId: reserveResponse.data.reservationId
            });
            console.log('✅ Inventory released:', releaseResponse.data);
        } catch (error) {
            console.log('❌ Inventory reservation failed:', error.response?.status, error.response?.data || error.message);
        }

        // Test order creation directly (bypassing auth middleware)
        try {
            console.log('📋 Testing order creation directly...');
            const orderData = {
                cart: [
                    {
                        productId: productId,
                        qty: 1,
                        price: 100,
                        discount: 1,
                        title: "Test Product - Direct Order"
                    }
                ],
                shippingAddress: {
                    street: "123 Test St",
                    city: "Test City", 
                    postalCode: "12345",
                    country: "Test Country"
                },
                paymentMethod: "cod",
                totalAmount: 100,
                userId: "507f1f77bcf86cd799439012" // Mock user ID
            };

            const response = await axios.post('http://localhost:3003/api/orders/test', orderData);
            console.log('✅ Order created successfully:', response.data);
        } catch (error) {
            console.log('❌ Order creation failed:', error.response?.status);
            console.log('❌ Error details:', error.response?.data || error.message);
            
            // Let's also check the full error response
            if (error.response) {
                console.log('❌ Response headers:', error.response.headers);
                console.log('❌ Response status text:', error.response.statusText);
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testOrderDirect();
