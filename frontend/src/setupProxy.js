const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const target = process.env.PROXY_HOST 
    ? `http://${process.env.PROXY_HOST}:${process.env.PROXY_PORT || 4000}`
    : 'http://localhost:4000';
    
  app.use(
    '/api',
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      logLevel: 'debug'
    })
  );
};
