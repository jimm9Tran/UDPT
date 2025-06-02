#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');

// Read session cookie from file
let cookies = '';
try {
    cookies = fs.readFileSync('session-cookie.txt', 'utf8').trim();
} catch (error) {
    console.log('⚠️  No session cookie file found. Please create admin user first.');
    process.exit(1);
}

const BASE_URL = 'http://localhost:3003'; // Direct to order service

async function testValidation() {
    console.log('🧪 Testing Validation Directly');
    console.log('===============================');
    
    // Test with minimal valid data first
    const minimalData = {
        cart: [
            {
                productId: '683cfdaaa8665b1cb6e2665b',
                qty: 1,
                title: 'Test Product',
                price: 299.99
            }
        ],
        paymentMethod: 'COD',
        shippingAddress: 'Test Address'
    };

    console.log('📤 Sending minimal valid data:');
    console.log(JSON.stringify(minimalData, null, 2));

    try {
        const response = await axios.post(`${BASE_URL}/api/orders`, minimalData, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies
            }
        });
        
        console.log('✅ Success! Status:', response.status);
        console.log('📥 Response:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('❌ Status:', error.response.status);
            console.log('📥 Response:', error.response.data);
            console.log('📥 Headers:', error.response.headers);
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

testValidation().catch(console.error);
