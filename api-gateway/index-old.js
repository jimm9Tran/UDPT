const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3005'], // React app URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

// Middleware for parsing JSON
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`[GATEWAY] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.log(`[GATEWAY] Headers:`, req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[GATEWAY] Body:`, req.body);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      user: process.env.USER_SERVICE_URL || 'http://localhost:3000',
      product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001',
      order: process.env.ORDER_SERVICE_URL || 'http://localhost:3002',
      payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003'
    }
  });
});

// Service URLs
const services = {
  user: process.env.USER_SERVICE_URL || 'http://localhost:3000',
  product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001',
  order: process.env.ORDER_SERVICE_URL || 'http://localhost:3002',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003'
};

// Proxy options
const proxyOptions = {
  changeOrigin: true,
  logLevel: 'debug',
  timeout: 60000, // 60 seconds timeout
  proxyTimeout: 60000, // 60 seconds proxy timeout
  onError: (err, req, res) => {
    console.error(`[ERROR] Proxy error for ${req.method} ${req.originalUrl}:`, err.message);
    console.error('Error stack:', err.stack);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Service temporarily unavailable',
        message: err.message,
        code: err.code
      });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${proxyReq.path}`);
    console.log(`[PROXY] Target: ${proxyReq.getHeader('host')}${proxyReq.path}`);
    
    // Forward cookies
    if (req.headers.cookie) {
      proxyReq.setHeader('Cookie', req.headers.cookie);
    }
    
    // Forward authorization header
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    
    // Log body for POST requests
    if (req.method === 'POST' && req.body) {
      console.log(`[PROXY] Request body:`, JSON.stringify(req.body));
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PROXY] Response status: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`);
    console.log(`[PROXY] Response headers:`, proxyRes.headers);
    
    // Forward cookies from services
    if (proxyRes.headers['set-cookie']) {
      res.setHeader('Set-Cookie', proxyRes.headers['set-cookie']);
    }
  }
};

// Route proxies
app.use('/api/users', createProxyMiddleware({
  target: services.user,
  pathRewrite: {
    '^/api/users': '/api/users'
  },
  headers: {
    'Connection': 'keep-alive',
  },
  ...proxyOptions
}));

app.use('/api/products', createProxyMiddleware({
  target: services.product,
  pathRewrite: {
    '^/api/products': '/api/products'
  },
  ...proxyOptions
}));

app.use('/api/orders', createProxyMiddleware({
  target: services.order,
  pathRewrite: {
    '^/api/orders': '/api/orders'
  },
  ...proxyOptions
}));

app.use('/api/payments', createProxyMiddleware({
  target: services.payment,
  pathRewrite: {
    '^/api/payments': '/api/payments'
  },
  ...proxyOptions
}));

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
  console.log(`🚀 API Gateway running on port ${PORT}`);
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
