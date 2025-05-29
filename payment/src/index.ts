// src/index.ts

import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './NatsWrapper';
import { OrderCreatedListener } from './events/listeners/OrderCreatedListener';
import { OrderCancelledListener } from './events/listeners/OrderCancelledListener';

const start = async (): Promise<void> => {
  console.log('Khởi động Payment Service...');

  // Kiểm tra các biến môi trường bắt buộc
  if (process.env.JWT_KEY == null) {
    throw new Error('JWT_KEY must be defined');
  }
  if (process.env.MONGO_URI == null) {
    throw new Error('MONGO_URI must be defined');
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
  if (process.env.VNPAY_TMN_CODE == null) {
    throw new Error('VNPAY_TMN_CODE must be defined');
  }
  if (process.env.VNPAY_HASH_SECRET == null) {
    throw new Error('VNPAY_HASH_SECRET must be defined');
  }
  if (process.env.VNPAY_URL == null) {
    throw new Error('VNPAY_URL must be defined');
  }
  if (process.env.VNPAY_RETURN_URL == null) {
    throw new Error('VNPAY_RETURN_URL must be defined');
  }

  try {
    // Kết nối tới NATS Streaming Server
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    // Xử lý graceful shutdown cho NATS
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    process.on('SIGINT', () => { natsWrapper.client.close(); });
    process.on('SIGTERM', () => { natsWrapper.client.close(); });

    // Khởi tạo các event listeners
    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    // Kết nối tới MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Đã kết nối tới MongoDB');
  } catch (err) {
    console.error(err);
  }

  // Khởi động server trên port 3000
  app.listen(3000, () => {
    console.log('Payment Service đang chạy trên port 3000!!!!!');
  });
};

void start();
