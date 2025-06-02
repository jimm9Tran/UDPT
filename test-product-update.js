#!/usr/bin/env node

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testProductUpdate() {
  console.log('🧪 Testing Product Update with FormData...');

  try {
    const productId = '683d15e8e3d286cc3181be54';
    const formData = new FormData();
    
    // Add product data
    formData.append('title', 'Test Updated Product - FormData');
    formData.append('price', '20000000');
    formData.append('brand', 'Apple');
    formData.append('category', 'smartphone');
    formData.append('description', 'Updated via FormData test');
    formData.append('countInStock', '15');
    formData.append('tags', JSON.stringify(['test', 'formdata']));
    formData.append('features', JSON.stringify(['Test Feature 1', 'Test Feature 2']));
    formData.append('specifications', JSON.stringify({
      processor: 'A17 Pro',
      ram: '8GB',
      storage: '256GB'
    }));

    console.log('📤 Sending PATCH request...');
    
    const response = await axios.patch(
      `http://localhost:4000/api/products/${productId}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000, // 30 second timeout
      }
    );

    console.log('✅ Update successful!');
    console.log('📦 Response:', response.data);
    console.log('📊 Status:', response.status);

  } catch (error) {
    console.error('❌ Error updating product:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received. Request was:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testProductUpdate();
