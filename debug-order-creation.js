#!/usr/bin/env node

const http = require('http');
const fs = require('fs');

// Read session cookie from file
let cookies = '';
try {
    cookies = fs.readFileSync('session-cookie.txt', 'utf8').trim();
} catch (error) {
    console.log('⚠️  No session cookie file found. Please create admin user first.');
    process.exit(1);
}

const BASE_URL = 'http://localhost:4000'; // API Gateway

function makeRequest(method, path, data) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + path);
        
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies
            }
        };

        if (data) {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({ status: res.statusCode, data: response, headers: res.headers });
                } catch (error) {
                    resolve({ status: res.statusCode, data: body, headers: res.headers });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testOrderCreation() {
    console.log('🧪 Debug Order Creation');
    console.log('=======================');
    
    // Complete order structure with all required fields
    const orderData = {
        cart: [
            {
                productId: '683cfdaaa8665b1cb6e2665b',
                qty: 1,
                title: 'Test Product',
                price: 299.99,
                discount: 1,
                color: 'red',
                size: 'M',
                image: 'test.jpg',
                countInStock: 1,
                userId: 'test-user'
            }
        ],
        paymentMethod: 'COD',
        shippingAddress: {
            address: '123 Test Street',
            city: 'Test City',
            postalCode: '12345',
            country: 'Vietnam'
        },
        itemsPrice: 299.99,
        taxPrice: 20.99,
        shippingPrice: 30.00,
        totalPrice: 350.98
    };

    console.log('📤 Sending order data:');
    console.log(JSON.stringify(orderData, null, 2));

    try {
        const response = await makeRequest('POST', '/api/orders', orderData);
        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', response.headers);
        console.log('📥 Response data:');
        console.log(JSON.stringify(response.data, null, 2));
        
        if (response.status >= 400) {
            console.log('❌ Order creation failed with status:', response.status);
        } else {
            console.log('✅ Order created successfully!');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testOrderCreation().catch(console.error);
