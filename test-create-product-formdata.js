const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_BASE = 'http://localhost:4000/api';

async function testCreateProductWithFormData() {
  try {
    console.log('🧪 Testing product creation with FormData (like frontend)...');
    
    const form = new FormData();
    
    // Add product data exactly like frontend does
    const productData = {
      title: 'Test Product FormData - Samsung Galaxy S24',
      price: 22000000,
      originalPrice: 25000000,
      brand: 'Samsung',
      category: 'Điện thoại', // Vietnamese category
      description: 'Test product description for Samsung Galaxy S24',
      countInStock: 15,
      specifications: {
        processor: 'Snapdragon 8 Gen 3',
        ram: '12GB',
        storage: '256GB',
        display: '6.2 inch Dynamic AMOLED'
      },
      features: ['120Hz Display', 'Triple Camera'],
      tags: ['smartphone', 'samsung'],
      isActive: true,
      isFeatured: true
    };

    // Add data to form exactly like frontend
    Object.keys(productData).forEach(key => {
      if (productData[key] !== undefined && productData[key] !== null) {
        if (typeof productData[key] === 'object' && !Array.isArray(productData[key])) {
          form.append(key, JSON.stringify(productData[key]));
        } else if (Array.isArray(productData[key])) {
          form.append(key, JSON.stringify(productData[key]));
        } else {
          form.append(key, productData[key]);
        }
      }
    });

    console.log('📤 Sending POST request with FormData...');
    console.log('🎯 URL:', `${API_BASE}/products`);

    const response = await axios.post(`${API_BASE}/products`, form, {
      headers: {
        ...form.getHeaders(),
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Product created successfully with FormData!');
    console.log('📦 Response:', response.data);
    console.log('🆔 Product ID:', response.data.id || response.data._id);

  } catch (error) {
    console.error('❌ Error creating product with FormData:');
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Status Text:', error.response.statusText);
      console.error('🔍 Response Data:', error.response.data);
    } else if (error.request) {
      console.error('🌐 Network Error:', error.message);
    } else {
      console.error('⚠️ Error:', error.message);
    }
  }
}

// Run test
testCreateProductWithFormData();
