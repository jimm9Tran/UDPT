import express from 'express';
import mongoose from 'mongoose';
import { natsWrapper } from '../NatsWrapper';

const router = express.Router();

// Basic health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'order-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API health check (for internal use)
router.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'order-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// MongoDB health check
router.get('/api/health/mongo', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  
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

// NATS health check
router.get('/api/health/nats', (req, res) => {
  try {
    const isConnected = natsWrapper.isConnected;
    
    if (isConnected) {
      res.status(200).json({
        status: 'healthy',
        messaging: 'nats',
        state: 'connected',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        messaging: 'nats',
        state: 'disconnected',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      messaging: 'nats',
      error: 'NATS client not initialized',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as healthRouter };
