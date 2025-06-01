// index.ts

import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { natsWrapper } from './NatsWrapper';
import { OrderCreatedListener } from './events/listeners/OrderCreatedListener';

const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'expiration-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const start = async (): Promise<void> => {
  console.log('Starting expiration service...');

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
    // Start HTTP server for health checks
    const port = process.env.PORT || 3006;
    app.listen(port, () => {
      console.log(`Expiration service health server listening on port ${port}`);
    });

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
    console.log('Expiration service started successfully');
  }
  catch (err) {
    console.error(err);
  }
};

void start();