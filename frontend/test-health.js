const axios = require('axios');
const API_HOST = 'http://localhost:4000';

async function testHealthAPI() {
  try {
    console.log('Testing health API...');
    const response = await axios.get(`${API_HOST}/health/services`);
    console.log('✅ Health API Response:');
    console.log('Status:', response.status);
    console.log('Services:', Object.keys(response.data.services));
    console.log('All services healthy:', Object.values(response.data.services).every(s => s.status === 'healthy'));
    
    // Show detailed service info
    Object.entries(response.data.services).forEach(([name, info]) => {
      console.log(`${name}: ${info.status} (${info.url})`);
    });
  } catch (error) {
    console.error('❌ Health API Error:', error.message);
  }
}

testHealthAPI();
