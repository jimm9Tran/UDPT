import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { NotFoundError, errorHandler } from '@jimm9tran/common';
import { enhancedCurrentUser } from './middleware/enhanced-current-user-v2';

import { showMyOrderRouter } from './routes/show-my-order';
import { showAllOrderRouter } from './routes/show-all-order';
import { cancelOrderRouter } from './routes/cancel-order';
import { getOrderRouter } from './routes/get-order';
import { createOrderRouter } from './routes/create-order';
import { deliverOrderRouter } from './routes/deliver-order';
import { showProductRouter } from './routes/show-product';
import { healthRouter } from './routes/health';
import { adminOrderRouter } from './routes/admin-orders-simple';
import { testOrderRouter } from './routes/test-route';

const app = express();
app.set('trust proxy', true);
app.use(express.json());

// Health check first (no auth required)
app.use(healthRouter);

app.use(
  cookieSession({
    signed: false,
    // secure: process.env.NODE_ENV === 'production'
    secure: false, // For local development, set to false
    httpOnly: true,
  })
);
app.use(enhancedCurrentUser);

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - Headers:`, req.headers.authorization ? 'Bearer token present' : 'No Bearer token');
  next();
});

console.log('🔧 Registering routes...');
app.use(showProductRouter);
app.use(showMyOrderRouter);
app.use(getOrderRouter);
app.use(deliverOrderRouter);
app.use(cancelOrderRouter);
app.use(showAllOrderRouter);
app.use(createOrderRouter);
console.log('✅ createOrderRouter registered');
app.use(adminOrderRouter);
console.log('✅ adminOrderRouter registered');
app.use(testOrderRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
