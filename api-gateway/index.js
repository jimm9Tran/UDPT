const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3005'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

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

// Detailed health check with service status
app.get('/health/services', async (req, res) => {
  const serviceStatuses = {};
  
  for (const [serviceName, serviceUrl] of Object.entries(services)) {
    try {
      const healthUrl = `${serviceUrl}/api/health`;
      console.log(`🔍 Checking health for ${serviceName} at ${healthUrl}`);
      
      const response = await axios.get(healthUrl, { timeout: 5000 });
      
      // Extract detailed response data if available
      const responseData = response.data || {};
      console.log(`✅ ${serviceName} health response:`, responseData);
      
      serviceStatuses[serviceName] = {
        status: 'healthy',
        url: serviceUrl,
        responseTime: response.headers['x-response-time'] || 'N/A',
        lastChecked: new Date().toISOString(),
        response: {
          uptime: responseData.uptime || null,
          timestamp: responseData.timestamp || new Date().toISOString(),
          version: responseData.version || 'N/A',
          memory: responseData.memory || null,
          database: responseData.database || null
        }
      };
    } catch (error) {
      console.error(`❌ ${serviceName} health check failed:`, error.message);
      serviceStatuses[serviceName] = {
        status: 'unhealthy',
        url: serviceUrl,
        error: error.message,
        lastChecked: new Date().toISOString(),
        response: null
      };
    }
  }
  
  const healthyCount = Object.values(serviceStatuses).filter(s => s.status === 'healthy').length;
  const totalCount = Object.keys(serviceStatuses).length;
  
  console.log(`📊 Health summary: ${healthyCount}/${totalCount} services healthy`);
  
  res.json({
    overallStatus: healthyCount === totalCount ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: serviceStatuses,
    summary: {
      total: totalCount,
      healthy: healthyCount,
      unhealthy: totalCount - healthyCount
    }
  });
});

// Create proxy middleware options
const createProxyOptions = (target) => ({
  target,
  changeOrigin: true,
  timeout: 10000,
  proxyTimeout: 10000,
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error(`[PROXY ERROR] ${req.method} ${req.originalUrl}:`, err.message);
    if (!res.headersSent) {
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Service temporarily unavailable',
        timestamp: new Date().toISOString()
      });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY] ${req.method} ${req.originalUrl} -> ${target}${req.originalUrl}`);
    console.log(`[PROXY] Content-Type: ${req.headers['content-type']}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PROXY] Response: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`);
  }
});

// Route handlers using http-proxy-middleware
app.use('/api/users', createProxyMiddleware('/api/users', createProxyOptions(services.user)));
app.use('/api/products', createProxyMiddleware('/api/products', createProxyOptions(services.product)));
app.use('/api/bestsellers', createProxyMiddleware('/api/bestsellers', createProxyOptions(services.product)));
// Note: Product service handles bestsellers too
app.use('/api/orders', createProxyMiddleware('/api/orders', createProxyOptions(services.order)));
app.use('/api/payments', createProxyMiddleware('/api/payments', createProxyOptions(services.payment)));

// Fallback route
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`🚀 HTTP API Gateway running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log('🔗 Service routes:');
  console.log(`   Users:    http://localhost:${PORT}/api/users`);
  console.log(`   Products: http://localhost:${PORT}/api/products`);
  console.log(`   Orders:   http://localhost:${PORT}/api/orders`);
  console.log(`   Payments: http://localhost:${PORT}/api/payments`);
});

module.exports = app;
