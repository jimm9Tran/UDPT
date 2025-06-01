import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Basic health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'user-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API health check (for internal use)
router.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'user-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// MongoDB health check
router.get('/api/health/mongo', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoStatus === 1) {
    res.status(200).json({
      status: 'healthy',
      database: 'mongodb',
      state: 'connected',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'unhealthy',
      database: 'mongodb',
      state: mongoStatus === 0 ? 'disconnected' : 
             mongoStatus === 2 ? 'connecting' : 'disconnecting',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as healthRouter };
