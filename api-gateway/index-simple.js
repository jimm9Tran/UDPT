const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3005'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);
app.use(express.json());

// Service URLs
const services = {
  user: process.env.USER_SERVICE_URL || 'http://user-service:3000',
  product: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3000',
  order: process.env.ORDER_SERVICE_URL || 'http://order-service:3000',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3000'
};

console.log('🔧 Service configuration:');
console.log(services);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services
  });
});

// Simple proxy function
const proxyRequest = async (req, res, serviceUrl) => {
  try {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${serviceUrl}${req.originalUrl}`);
    
    const config = {
      method: req.method.toLowerCase(),
      url: `${serviceUrl}${req.originalUrl}`,
      headers: {
        ...req.headers,
        host: undefined, // Remove host header
      },
      timeout: 30000,
    };

    // Include body for POST/PUT requests
    if (['post', 'put', 'patch'].includes(config.method)) {
      config.data = req.body;
      console.log(`[PROXY] Request body:`, req.body);
    }

    // Include cookies
    if (req.headers.cookie) {
      config.headers.cookie = req.headers.cookie;
    }

    console.log(`[PROXY] Making request to: ${config.url}`);
    
    const response = await axios(config);
    
    console.log(`[PROXY] Response status: ${response.status}`);
    
    // Forward cookies
    if (response.headers['set-cookie']) {
      res.setHeader('set-cookie', response.headers['set-cookie']);
    }
    
    // Forward other headers
    Object.keys(response.headers).forEach(key => {
      if (key !== 'set-cookie' && key !== 'content-encoding' && key !== 'transfer-encoding') {
        res.setHeader(key, response.headers[key]);
      }
    });
    
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error(`[ERROR] Proxy error for ${req.method} ${req.originalUrl}:`, {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: 'Service temporarily unavailable',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Route handlers
app.use('/api/users', (req, res) => proxyRequest(req, res, services.user));
app.use('/api/products', (req, res) => proxyRequest(req, res, services.product));
app.use('/api/orders', (req, res) => proxyRequest(req, res, services.order));
app.use('/api/payments', (req, res) => proxyRequest(req, res, services.payment));

// Fallback route
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Simple API Gateway running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log('🔗 Service routes:');
  console.log(`   Users:    http://localhost:${PORT}/api/users`);
  console.log(`   Products: http://localhost:${PORT}/api/products`);
  console.log(`   Orders:   http://localhost:${PORT}/api/orders`);
  console.log(`   Payments: http://localhost:${PORT}/api/payments`);
  console.log('🌐 Configured services:');
  Object.entries(services).forEach(([name, url]) => {
    console.log(`   ${name.padEnd(8)}: ${url}`);
  });
});

module.exports = app;
