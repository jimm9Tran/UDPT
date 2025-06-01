const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Remove global axios timeout
// axios.defaults.timeout = 30000;

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
  user: process.env.USER_SERVICE_URL || 'http://172.18.0.7:3000',
  product: process.env.PRODUCT_SERVICE_URL || 'http://172.18.0.5:3000',
  order: process.env.ORDER_SERVICE_URL || 'http://172.18.0.6:3000',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://172.18.0.9:3000'
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

// Health check for all services
app.get('/api/health-check', async (req, res) => {
  const healthChecks = {};
  
  // Check each service
  for (const [serviceName, serviceUrl] of Object.entries(services)) {
    try {
      const response = await axios.get(`${serviceUrl}/api/health`, {
        timeout: 5000,
        validateStatus: () => true
      });
      
      healthChecks[serviceName] = {
        status: response.status === 200 ? 'healthy' : 'unhealthy',
        url: serviceUrl,
        responseTime: response.headers['x-response-time'] || 'N/A',
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      healthChecks[serviceName] = {
        status: 'unhealthy',
        url: serviceUrl,
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  }

  // Check external dependencies
  try {
    // Check MongoDB (through user service)
    const mongoCheck = await axios.get(`${services.user}/api/health/mongo`, {
      timeout: 3000,
      validateStatus: () => true
    });
    
    healthChecks.mongodb = {
      status: mongoCheck.status === 200 ? 'healthy' : 'unhealthy',
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    healthChecks.mongodb = {
      status: 'unhealthy',
      error: error.message,
      lastChecked: new Date().toISOString()
    };
  }

  try {
    // Check NATS (through any service that uses NATS)
    const natsCheck = await axios.get(`${services.order}/api/health/nats`, {
      timeout: 3000,
      validateStatus: () => true
    });
    
    healthChecks.nats = {
      status: natsCheck.status === 200 ? 'healthy' : 'unhealthy',
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    healthChecks.nats = {
      status: 'unhealthy',
      error: error.message,
      lastChecked: new Date().toISOString()
    };
  }

  // Overall system status
  const allHealthy = Object.values(healthChecks).every(check => check.status === 'healthy');
  
  res.json({
    systemStatus: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: healthChecks
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
        'user-agent': 'api-gateway/1.0.0'
      },
      timeout: 10000, // Reduce timeout to 10 seconds for debugging
      validateStatus: () => true, // Accept all status codes
    };

    // Include body for POST/PUT requests
    if (['post', 'put', 'patch'].includes(config.method)) {
      config.data = req.body;
      console.log(`[PROXY] Request body:`, req.body);
      console.log(`[PROXY] Headers:`, config.headers);
    }

    // Include cookies
    if (req.headers.cookie) {
      config.headers.cookie = req.headers.cookie;
    }

    console.log(`[PROXY] Making request to: ${config.url}`);
    console.log(`[PROXY] Full config:`, JSON.stringify(config, null, 2));
    
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
app.use('/api/bestsellers', (req, res) => proxyRequest(req, res, services.product));
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
