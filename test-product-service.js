const axios = require('axios');

async function testProductService() {
    console.log('🧪 Testing Product Service API calls from Order Service perspective...');
    
    try {
        // Test product retrieval
        const productId = '683c97625db69e737ebe6f49';  // Use the newly created test product
        console.log('🔍 Testing product retrieval...');
        
        const productResponse = await axios.get(`http://localhost:4002/api/products/${productId}`);
        console.log('✅ Product found:', productResponse.data.title);
        console.log('📦 Stock:', productResponse.data.countInStock);
        
        // Test inventory reservation
        console.log('🔒 Testing inventory reservation...');
        const reservationResponse = await axios.post('http://localhost:4002/api/products/reserve-inventory', {
            items: [{
                productId: productId,
                quantity: 1
            }]
        });
        
        console.log('✅ Reservation successful:', reservationResponse.data);
        
        // Test inventory release
        if (reservationResponse.data.reservationId) {
            console.log('🔓 Testing inventory release...');
            const releaseResponse = await axios.post('http://localhost:4002/api/products/release-inventory', {
                reservationId: reservationResponse.data.reservationId
            });
            console.log('✅ Release successful:', releaseResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Product service test failed:', error.response?.status, error.response?.data || error.message);
    }
}

testProductService();
