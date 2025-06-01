const express = require('express');
const cors = require('cors');
const http = require('http');
const { URL } = require('url');
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

// Service URLs (Using internal Docker ports - all services run on port 3000 internally)
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

// Comprehensive health check for all services
app.get('/health/services', async (req, res) => {
  const healthChecks = {};
  
  try {
    // Check all services
    const checkPromises = Object.entries(services).map(async ([serviceName, serviceUrl]) => {
      try {
        const targetUrl = new URL('/api/health', serviceUrl);
        const response = await new Promise((resolve, reject) => {
          const options = {
            hostname: targetUrl.hostname,
            port: targetUrl.port,
            path: targetUrl.pathname,
            method: 'GET',
            timeout: 3000
          };
          
          const request = require('http').request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              try {
                const result = JSON.parse(data);
                resolve({ status: res.statusCode, data: result });
              } catch (e) {
                resolve({ status: res.statusCode, data: data });
              }
            });
          });
          
          request.on('error', reject);
          request.on('timeout', () => {
            request.destroy();
            reject(new Error('Timeout'));
          });
          
          request.end();
        });
        
        healthChecks[serviceName] = {
          status: response.status === 200 ? 'healthy' : 'unhealthy',
          url: serviceUrl,
          response: response.data
        };
      } catch (error) {
        healthChecks[serviceName] = {
          status: 'unhealthy',
          url: serviceUrl,
          error: error.message
        };
      }
    });
    
    await Promise.all(checkPromises);
    
    const overallStatus = Object.values(healthChecks).every(check => check.status === 'healthy') 
      ? 'healthy' : 'degraded';
    
    res.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: healthChecks
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// HTTP proxy function
const httpProxyRequest = (req, res, serviceUrl) => {
  return new Promise((resolve, reject) => {
    const targetUrl = new URL(req.originalUrl, serviceUrl);
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${targetUrl.href}`);
    
    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port,
      path: targetUrl.pathname + targetUrl.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: targetUrl.host,
        'user-agent': 'api-gateway/1.0.0'
      },
      timeout: 5000
    };
    
    // Remove undefined headers
    delete options.headers.host;
    if (options.headers.host === undefined) {
      delete options.headers.host;
    }
    
    console.log(`[PROXY] Making HTTP request to: ${targetUrl.href}`);
    console.log(`[PROXY] Options:`, JSON.stringify(options, null, 2));
    
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      const bodyData = JSON.stringify(req.body);
      options.headers['content-type'] = 'application/json';
      options.headers['content-length'] = Buffer.byteLength(bodyData);
      console.log(`[PROXY] Request body:`, req.body);
    }
    
    const proxyReq = http.request(options, (proxyRes) => {
      console.log(`[PROXY] Response status: ${proxyRes.statusCode}`);
      
      // Forward cookies
      if (proxyRes.headers['set-cookie']) {
        res.setHeader('set-cookie', proxyRes.headers['set-cookie']);
      }
      
      // Forward other headers
      Object.keys(proxyRes.headers).forEach(key => {
        if (key !== 'set-cookie' && key !== 'content-encoding' && key !== 'transfer-encoding') {
          res.setHeader(key, proxyRes.headers[key]);
        }
      });
      
      res.status(proxyRes.statusCode);
      
      let responseData = '';
      proxyRes.on('data', (chunk) => {
        responseData += chunk;
      });
      
      proxyRes.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          res.json(jsonData);
        } catch (error) {
          res.send(responseData);
        }
        resolve();
      });
    });
    
    proxyReq.on('timeout', () => {
      console.error(`[ERROR] Timeout for ${req.method} ${req.originalUrl}`);
      proxyReq.destroy();
      res.status(504).json({
        error: 'Gateway timeout',
        message: 'Service did not respond in time',
        timestamp: new Date().toISOString()
      });
      reject(new Error('Timeout'));
    });
    
    proxyReq.on('error', (error) => {
      console.error(`[ERROR] Proxy error for ${req.method} ${req.originalUrl}:`, error.message);
      res.status(500).json({
        error: 'Service temporarily unavailable',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      reject(error);
    });
    
    // Write body for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      proxyReq.write(JSON.stringify(req.body));
    }
    
    proxyReq.end();
  });
};

// Route handlers
// Health check routes for each service (must be before general routes)
app.get('/api/health', async (req, res) => {
  try {
    await httpProxyRequest(req, res, services.user);
  } catch (error) {
    // Error already handled in httpProxyRequest
  }
});

app.use('/api/users', async (req, res) => {
  try {
    await httpProxyRequest(req, res, services.user);
  } catch (error) {
    // Error already handled in httpProxyRequest
  }
});

app.use('/api/products', async (req, res) => {
  try {
    await httpProxyRequest(req, res, services.product);
  } catch (error) {
    // Error already handled in httpProxyRequest
  }
});

app.use('/api/bestsellers', async (req, res) => {
  try {
    await httpProxyRequest(req, res, services.product);
  } catch (error) {
    // Error already handled in httpProxyRequest
  }
});

app.use('/api/orders', async (req, res) => {
  try {
    await httpProxyRequest(req, res, services.order);
  } catch (error) {
    // Error already handled in httpProxyRequest
  }
});

app.use('/api/payments', async (req, res) => {
  try {
    await httpProxyRequest(req, res, services.payment);
  } catch (error) {
    // Error already handled in httpProxyRequest
  }
});

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
