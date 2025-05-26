import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
console.log('Environment variables:', {
  MONGO_URI_PRODUCT: process.env.MONGO_URI_PRODUCT,
  JWT_KEY: process.env.JWT_KEY,
  NATS_CLIENT_ID: process.env.NATS_CLIENT_ID,
  NATS_URL: process.env.NATS_URL,
  NATS_CLUSTER_ID: process.env.NATS_CLUSTER_ID,
});
import { app } from './app';
import { OrderUpdatedListener } from './events/listeners/OrderUpdatedListener';
import { OrderCreatedListener } from './events/listeners/OrderCreatedListener';
import { natsWrapper } from './NatsWrapper';

const start = async (): Promise<void> => {
  console.log('Starting...');
   try {
    // Check biến môi trường
    if (!process.env.JWT_KEY) throw new Error('JWT_KEY must be defined');
    if (!process.env.MONGO_URI_PRODUCT) throw new Error('MONGO_URI_PRODUCT must be defined');
    if (!process.env.NATS_CLIENT_ID) throw new Error('NATS_CLIENT_ID must be defined');
    if (!process.env.NATS_URL) throw new Error('NATS_URL must be defined');
    if (!process.env.NATS_CLUSTER_ID) throw new Error('NATS_CLUSTER_ID must be defined');

   
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    

    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI_PRODUCT);
    console.log('✅ Connected to MongoDB');

    const port = 3000;
    console.log(`🚀 Sắp bắt đầu lắng nghe tại port ${port}`);
    app.listen(port, () => {
      console.log(`✅ Product server is listening on port ${port}`);
    });

  } catch (err) {
    console.error('❌ Lỗi khi khởi động server:', err);
    process.exit(1); // Thoát nếu có lỗi
  }
};

void start();
