const axios = require('axios');

async function testOrderCreation() {
    try {
        console.log('🧪 Testing Order Creation Flow...');
        
        // Test order service health
        try {
            const healthCheck = await axios.get('http://localhost:3003/health');
            console.log('✅ Order service health:', healthCheck.data);
        } catch (error) {
            console.log('❌ Order service health check failed:', error.message);
            return;
        }

        // Test the actual order creation with the fixed format
        console.log('📋 Testing order creation with fixed inventory reservation...');
        
        const orderData = {
            cart: [
                {
                    productId: "507f1f77bcf86cd799439011", // Mock product ID
                    qty: 2,
                    price: 100,
                    discount: 1,
                    title: "Test Product"
                },
                {
                    productId: "507f1f77bcf86cd799439012", // Another mock product ID
                    qty: 1,
                    price: 50,
                    discount: 1,
                    title: "Test Product 2"
                }
            ],
            shippingAddress: {
                street: "123 Test St",
                city: "Test City",
                postalCode: "12345",
                country: "Test Country"
            },
            paymentMethod: "cod",
            totalAmount: 250,
            userId: "507f1f77bcf86cd799439013" // Mock user ID
        };

        try {
            // Call the actual create order endpoint (not the test one)
            const response = await axios.post('http://localhost:3003/api/orders', orderData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Order created successfully!');
            console.log('📋 Order details:', response.data);
            
        } catch (error) {
            console.log('❌ Order creation failed with status:', error.response?.status);
            console.log('❌ Error details:', error.response?.data || error.message);
            
            // Check if it's a validation error (our main concern)
            if (error.response?.status === 400) {
                console.log('🔍 This appears to be a validation error - let\'s check what\'s being validated...');
                if (error.response.data && error.response.data.includes && error.response.data.includes('Invalid request parameters')) {
                    console.log('❌ Still getting validation errors - our fix may not be complete');
                } else {
                    console.log('🔍 Different type of validation error:', error.response.data);
                }
            }
            
            // Check if it's an inventory reservation error
            if (error.response?.data && error.response.data.message && error.response.data.message.includes('inventory')) {
                console.log('📦 This appears to be an inventory-related error (expected since using mock product IDs)');
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testOrderCreation();
