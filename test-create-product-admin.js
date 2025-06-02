const axios = require('axios');

const API_BASE = 'http://localhost:4000/api';

async function testCreateProduct() {
  try {
    console.log('🧪 Testing product creation through API Gateway...');
    
    // Simple JSON data first (without images)
    const productData = {
      title: 'Test Product - iPhone 15',
      price: 25000000,
      originalPrice: 30000000,
      brand: 'Apple',
      category: 'Điện thoại', // Vietnamese category
      description: 'Test product description for iPhone 15',
      countInStock: 10,
      specifications: {
        processor: 'A17 Pro',
        ram: '8GB',
        storage: '256GB',
        display: '6.1 inch Super Retina XDR'
      },
      features: ['Feature 1', 'Feature 2'],
      tags: ['smartphone', 'apple'],
      isActive: true,
      isFeatured: false
    };

    console.log('📤 Sending POST request to create product...');
    console.log('🎯 URL:', `${API_BASE}/products`);
    console.log('📋 Data keys:', Object.keys(productData));

    const response = await axios.post(`${API_BASE}/products`, productData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Product created successfully!');
    console.log('📦 Response:', response.data);
    console.log('🆔 Product ID:', response.data.id || response.data._id);

  } catch (error) {
    console.error('❌ Error creating product:');
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Status Text:', error.response.statusText);
      console.error('🔍 Response Data:', error.response.data);
      console.error('📋 Response Headers:', error.response.headers);
    } else if (error.request) {
      console.error('🌐 Network Error:', error.message);
      console.error('🔗 Request Config:', {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout
      });
    } else {
      console.error('⚠️ Error:', error.message);
    }
  }
}

// Run test
testCreateProduct();
