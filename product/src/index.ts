// index.ts

import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { app } from './app';
import { OrderUpdatedListener } from './events/listeners/OrderUpdatedListener';
import { OrderCreatedListener } from './events/listeners/OrderCreatedListener';
import { natsWrapper } from './NatsWrapper';
import ReservationCleanupService from './services/ReservationCleanupService';

const start = async (): Promise<void> => {
  console.log('Starting...');
  if (process.env.JWT_KEY == null) {
    throw new Error('JWT_KEY must be defined');
  }
  if (process.env.MONGO_URI_PRODUCT == null) {
    throw new Error('MONGO_URI_PRODUCT must be defined');
  }
  if (process.env.NATS_CLIENT_ID == null) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if (process.env.NATS_URL == null) {
    throw new Error('NATS_URL must be defined');
  }
  if (process.env.NATS_CLUSTER_ID == null) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }

  try {
    // Connect to MongoDB first
    await mongoose.connect(process.env.MONGO_URI_PRODUCT, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log('Connected to MongoDB');

    // Try to connect to NATS, but don't fail if it's not available
    try {
      await natsWrapper.connect(
        process.env.NATS_CLUSTER_ID,
        process.env.NATS_CLIENT_ID,
        process.env.NATS_URL
      );

      natsWrapper.client.on('close', () => {
        console.log('NATS connection closed!');
        process.exit();
      });

      process.on('SIGINT', () => { natsWrapper.client.close(); });
      process.on('SIGTERM', () => { natsWrapper.client.close(); });

      new OrderCreatedListener(natsWrapper.client).listen();
      new OrderUpdatedListener(natsWrapper.client).listen();
      console.log('Connected to NATS and listening for events');
    } catch (natsError: any) {
      console.warn('Failed to connect to NATS, continuing without event messaging:', natsError.message);
    }

    // Start reservation cleanup service
    const cleanupService = ReservationCleanupService.getInstance();
    cleanupService.startCleanupCron();
    console.log('🧹 Reservation cleanup service started');
  } catch (err) {
    console.error(err);
  }
  const port = 3000;
  app.listen(port, () => {
    console.log(`Product server: Listening on port ${port}`);
  });
};

void start();
