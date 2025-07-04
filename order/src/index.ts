import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


import { app } from './app';
import { natsWrapper } from './NatsWrapper';
import { ProductCreatedListener } from '../src/events/listeners/ProductCreatedListener';
import { ProductUpdatedListener } from '../src/events/listeners/ProductUpdatedListener';
import { ExpirationCompletedListener } from './events/listeners/ExpirationCompletedListener';
import { PaymentCreatedListener } from './events/listeners/PaymentCreatedListener';

const start = async (): Promise<void> => {
  console.log('Starting...');
  if (process.env.JWT_KEY == null) {
    throw new Error('JWT_KEY must be defined');
  }
  if (process.env.MONGO_URI_ORDER == null) {
    throw new Error('MONGO_URI_ORDER must be defined');
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

    new ProductCreatedListener(natsWrapper.client).listen();
    new ProductUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompletedListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI_ORDER);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }  const port = 3000;
  app.listen(port, () => {
    console.log(`Order server: Listening on port ${port}`);
  });
};

void start();
