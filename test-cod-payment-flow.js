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

const PRODUCT_BASE_URL = 'http://localhost:3001';
const ORDER_BASE_URL = 'http://localhost:3002';
const PAYMENT_BASE_URL = 'http://localhost:3003';

function makeRequest(method, path, data, serviceBase = ORDER_BASE_URL) {
    return new Promise((resolve, reject) => {
        // Use direct service base URL
        const url = new URL(serviceBase + path);
        
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

async function checkProductStock(productId) {
    try {
        const response = await makeRequest('GET', `/api/products/${productId}`, null, PRODUCT_BASE_URL);
        if (response.status === 200) {
            console.log(`📦 Product: ${response.data.title}`);
            console.log(`📦 Stock: ${response.data.countInStock}`);
            console.log(`🔒 Reserved: ${response.data.isReserved}`);
            console.log(`🆔 Reserved by: ${response.data.reservedBy || 'N/A'}`);
            return response.data;
        } else {
            console.log('❌ Failed to get product:', response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error getting product:', error.message);
        return null;
    }
}

async function createOrder(productId) {
    console.log('📝 Creating order...');
    
    const orderData = {
        cart: [
            {
                userId: "user123", // This will be set by the middleware based on auth
                productId: productId,
                qty: 1,
                title: 'Test Product - Inventory Test',
                price: 299.99,
                discount: 1, // Should be 1 for no discount, not 0
                color: 'red',
                size: 'M',
                image: 'test-image.jpg',
                countInStock: 1
            }
        ],
        paymentMethod: 'COD', // Cash on Delivery
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

    try {
        const response = await makeRequest('POST', '/api/orders', orderData, ORDER_BASE_URL);
        if (response.status === 201) {
            console.log('✅ Order created successfully!');
            console.log('🆔 Order ID:', response.data.id || response.data._id);
            console.log('💰 Total Price:', response.data.totalPrice);
            console.log('💳 Payment Method:', response.data.paymentMethod);
            console.log('📋 Status:', response.data.status);
            return response.data;
        } else {
            console.log('❌ Failed to create order:', response.status, response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error creating order:', error.message);
        return null;
    }
}

async function processCODPayment(orderId, amount) {
    console.log('💳 Processing COD payment...');
    
    const paymentData = {
        orderId: orderId,
        paymentMethod: 'COD',
        amount: amount,
        currency: 'VND'
    };

    try {
        const response = await makeRequest('POST', '/api/payments', paymentData, PAYMENT_BASE_URL);
        if (response.status === 201) {
            console.log('✅ COD Payment processed successfully!');
            console.log('🆔 Payment ID:', response.data.id || response.data._id);
            console.log('💰 Amount:', response.data.amount);
            console.log('📋 Status:', response.data.status);
            return response.data;
        } else {
            console.log('❌ Failed to process payment:', response.status, response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error processing payment:', error.message);
        return null;
    }
}

async function checkOrderStatus(orderId) {
    try {
        const response = await makeRequest('GET', `/api/orders/${orderId}`, null, ORDER_BASE_URL);
        if (response.status === 200) {
            console.log(`📋 Order Status: ${response.data.status}`);
            console.log(`💳 Payment Status: ${response.data.paymentResult?.status || 'N/A'}`);
            console.log(`📦 Cart Items:`);
            (response.data.cart || []).forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.title || item.name} x${item.qty || item.quantity} = $${item.price}`);
            });
            return response.data;
        } else {
            console.log('❌ Failed to get order:', response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error getting order:', error.message);
        return null;
    }
}

async function createTestProduct() {
    console.log('🧩 No products found. Creating a test product...');
    const productData = {
      title: 'Auto Test COD Product',
      price: 1000,
      originalPrice: 1200,
      brand: 'Other',  // Use valid enum brand
      category: 'Laptop',
      description: 'Automatically created test product',
      countInStock: 5,
      specifications: { processor: 'TestCPU', ram: '8GB', storage: '256GB', display: 'TestDisplay' },
      features: ['TestFeature'],
      tags: ['test']
    };
    const response = await makeRequest('POST', '/api/products', productData, PRODUCT_BASE_URL);
    console.log('🔍 createTestProduct response:', JSON.stringify(response, null, 2));
    if (response.status === 201) {
      const newId = response.data.id || response.data._id;
      console.log('✅ Test product created with ID:', newId);
      return newId;
    } else {
      console.error('❌ Failed to create test product:', response.status, response.data);
      return null;
    }
}

// Insert service readiness checks before executing flow
async function waitForService(baseUrl, healthPath, serviceName, retries = 10, interval = 3000) {
    for (let i = 0; i < retries; i++) {
        try {
            const resp = await makeRequest('GET', healthPath, null, baseUrl);
            if (resp.status === 200) {
                console.log(`✅ ${serviceName} is healthy`);
                return;
            }
        } catch (err) {
            // ignore
        }
        console.log(`⌛ Waiting for ${serviceName}... (${i+1}/${retries})`);
        await new Promise(res => setTimeout(res, interval));
    }
    console.error(`❌ ${serviceName} did not become healthy in time`);
    process.exit(1);
}

(async () => {
     console.log('🧪 Complete COD Payment Flow Test');
    console.log('===================================');
    
    // Fetch available products to select a test product
    console.log('🔍 Waiting for services to be ready...');
    await waitForService(PRODUCT_BASE_URL, '/api/health', 'Product Service');
    await waitForService(ORDER_BASE_URL, '/api/health', 'Order Service');
    await waitForService(PAYMENT_BASE_URL, '/api/health', 'Payment Service');
    console.log('🔍 Step 0: Fetching available products...');
 // Step 0: Fetch available products
     let products = [];
     try {
        const response = await makeRequest('GET', '/api/products', null, PRODUCT_BASE_URL);
        products = response.data.products || response.data;
    } catch (error) {
        console.error('❌ Error fetching products:', error.message);
    }
    
    // Choose a product that is not currently reserved
    const availableProducts = products.filter(p => !p.isReserved);
    if (availableProducts.length === 0) {
      console.error('❌ No available products (all reserved). Please cleanup reservations or use a new product.');
      return;
    }
    const lastProduct = availableProducts[availableProducts.length - 1];
    const productId = lastProduct.id || lastProduct._id;
    console.log('🔨 Using test product:', productId);
    
    // Step 1: Check initial product state
    console.log('\n📦 Step 1: Check product state...');
    const initialProduct = await checkProductStock(productId);
    if (!initialProduct) {
        console.log('❌ Product not found. Please create a test product first.');
        return;
    }
    
    // Step 2: Create order with COD payment method
    console.log('\n📝 Step 2: Create order...');
    const order = await createOrder(productId);
    if (!order) {
        console.log('❌ Cannot proceed without order');
        return;
    }
    
    // Wait for order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Process COD payment
    console.log('\n💳 Step 3: Process COD payment...');
    const payment = await processCODPayment(order.id, order.totalPrice);
    if (!payment) {
        console.log('❌ Payment processing failed');
        return;
    }
    
    // Wait for payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Check final order status
    console.log('\n📋 Step 4: Check final order status...');
    const finalOrder = await checkOrderStatus(order.id || order._id);
    
    // Step 5: Check product inventory after order
    console.log('\n📦 Step 5: Check product inventory after order...');
    const finalProduct = await checkProductStock(productId);
    
    // Summary
    console.log('\n📋 COMPLETE COD FLOW TEST SUMMARY');
    console.log('==================================');
    
    const orderCreated = !!order;
    const paymentProcessed = !!payment;
    const inventoryUpdated = finalProduct && finalProduct.countInStock < initialProduct.countInStock;
    
    if (orderCreated && paymentProcessed && inventoryUpdated) {
        console.log('✅ COD Payment Flow is working correctly!');
        console.log('✅ Order creation: SUCCESS');
        console.log('✅ COD Payment processing: SUCCESS');
        console.log('✅ Inventory update: SUCCESS');
        console.log(`✅ Stock decreased: ${initialProduct.countInStock} → ${finalProduct.countInStock}`);
    } else {
        console.log('❌ COD Payment Flow has issues:');
        console.log(`   Order creation: ${orderCreated ? '✅' : '❌'}`);
        console.log(`   Payment processing: ${paymentProcessed ? '✅' : '❌'}`);
        console.log(`   Inventory update: ${inventoryUpdated ? '✅' : '❌'}`);
    }
    
    if (finalOrder) {
        console.log(`\n📋 Final Order State:`);
        console.log(`   Order ID: ${finalOrder.id || finalOrder._id}`);
        console.log(`   Status: ${finalOrder.status}`);
        console.log(`   Payment Method: ${finalOrder.paymentMethod}`);
        console.log(`   Total: $${finalOrder.totalPrice}`);
    }
})().catch(console.error);
