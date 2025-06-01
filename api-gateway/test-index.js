const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Test endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 'not set'
  });
});

app.get('/test', (req, res) => {
  res.json({ message: 'API Gateway is working!' });
});

const PORT = process.env.PORT || 4000;

console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('Starting on port:', PORT);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});
