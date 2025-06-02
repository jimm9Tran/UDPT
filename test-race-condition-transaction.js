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
                    resolve({ status: res.statusCode, data: response });
                } catch (error) {
                    resolve({ status: res.statusCode, data: body });
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

async function createTestProduct() {
    console.log('🔨 Creating test product with 1 item in stock...');
    
    const productData = {
        title: 'Limited Edition Test Product - ' + Date.now(),
        description: 'Only 1 item available for race condition testing',
        price: 100000,
        countInStock: 1, // Only 1 item - perfect for race condition test
        brand: 'APPLE',
        category: 'PHONE',
        images: [
            {
                url: 'https://example.com/test1.jpg',
                altText: 'Test Image 1'
            }
        ]
    };

    try {
        const response = await makeRequest('POST', '/api/products', productData);
        if (response.status === 201) {
            console.log('✅ Test product created:', response.data._id);
            return response.data._id;
        } else {
            console.log('❌ Failed to create product:', response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error creating product:', error.message);
        return null;
    }
}

async function reserveInventory(productId, customerId) {
    const reservationData = {
        items: [
            {
                productId: productId,
                quantity: 1
            }
        ]
    };

    try {
        const start = Date.now();
        const response = await makeRequest('POST', '/api/products/reserve-inventory', reservationData);
        const duration = Date.now() - start;
        
        return {
            customerId,
            status: response.status,
            data: response.data,
            duration
        };
    } catch (error) {
        return {
            customerId,
            status: 'error',
            data: error.message,
            duration: 0
        };
    }
}

async function testRaceCondition(productId) {
    console.log('\n🏁 Starting race condition test...');
    console.log('Multiple customers will try to buy the same product simultaneously');
    
    // Simulate 5 customers trying to buy the same product at the same time
    const customers = Array.from({length: 5}, (_, i) => `customer-${i + 1}`);
    
    console.log(`\n⚡ ${customers.length} customers racing to buy product ${productId}...`);
    
    // Start all requests simultaneously
    const promises = customers.map(customerId => reserveInventory(productId, customerId));
    
    const results = await Promise.all(promises);
    
    console.log('\n📊 Race condition test results:');
    console.log('=' .repeat(60));
    
    let successCount = 0;
    let failureCount = 0;
    
    results.forEach(result => {
        const status = result.status === 200 ? '✅ SUCCESS' : '❌ FAILED';
        const message = result.status === 200 
            ? `Reserved successfully (${result.duration}ms)`
            : `${result.data.error || result.data.message || 'Unknown error'} (${result.duration}ms)`;
            
        console.log(`${result.customerId}: ${status} - ${message}`);
        
        if (result.status === 200) {
            successCount++;
        } else {
            failureCount++;
        }
    });
    
    console.log('=' .repeat(60));
    console.log(`✅ Successful reservations: ${successCount}`);
    console.log(`❌ Failed reservations: ${failureCount}`);
    
    if (successCount === 1 && failureCount === 4) {
        console.log('\n🎉 RACE CONDITION TEST PASSED!');
        console.log('✓ Only one customer was able to reserve the product');
        console.log('✓ MongoDB transactions working correctly');
        return true;
    } else if (successCount > 1) {
        console.log('\n💥 RACE CONDITION TEST FAILED!');
        console.log('✗ Multiple customers reserved the same product');
        console.log('✗ Inventory management has issues');
        return false;
    } else if (successCount === 0) {
        console.log('\n⚠️  UNEXPECTED RESULT!');
        console.log('✗ No customer was able to reserve the product');
        console.log('✗ Check product availability and reservation logic');
        return false;
    }
}

async function checkProductStock(productId) {
    console.log('\n🔍 Checking final product stock...');
    
    try {
        const response = await makeRequest('GET', `/api/products/${productId}`);
        if (response.status === 200) {
            const product = response.data;
            console.log(`Product: ${product.title}`);
            console.log(`Stock: ${product.countInStock}`);
            console.log(`Reserved: ${product.isReserved}`);
            console.log(`Reserved by: ${product.reservedBy || 'N/A'}`);
            console.log(`Reserved at: ${product.reservedAt || 'N/A'}`);
            
            return product;
        } else {
            console.log('❌ Failed to get product:', response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error getting product:', error.message);
        return null;
    }
}

async function main() {
    console.log('🧪 MongoDB Transaction Race Condition Test');
    console.log('==========================================');
    
    // Use existing test product ID
    const productId = '683cfc2f1ee05ed7a9951de0';
    console.log('🔨 Using existing test product:', productId);
    
    // Check initial product state
    console.log('\n📦 Checking initial product state...');
    const initialProduct = await checkProductStock(productId);
    if (!initialProduct) {
        console.log('❌ Product not found. Please create a test product first.');
        return;
    }
    
    console.log(`📦 Initial stock: ${initialProduct.countInStock}`);
    console.log(`🔒 Is reserved: ${initialProduct.isReserved}`);
    
    // Wait a moment for product to be fully created
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Test race condition
    const testPassed = await testRaceCondition(productId);
    
    // Step 3: Check final state
    const finalProduct = await checkProductStock(productId);
    
    // Summary
    console.log('\n📋 TEST SUMMARY');
    console.log('===============');
    if (testPassed) {
        console.log('✅ MongoDB transactions are working correctly');
        console.log('✅ Race condition protection is effective');
        console.log('✅ Only one customer can buy the last product');
    } else {
        console.log('❌ MongoDB transactions need debugging');
        console.log('❌ Race condition protection failed');
        console.log('❌ Multiple customers might buy the same product');
    }
    
    if (finalProduct) {
        console.log(`\n📦 Final product state:`);
        console.log(`   Stock remaining: ${finalProduct.countInStock}`);
        console.log(`   Is reserved: ${finalProduct.isReserved}`);
    }
}

main().catch(console.error);
