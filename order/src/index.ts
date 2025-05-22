import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './NatsWrapper';

const start = async () => {
  // 1. Kiểm tra biến môi trường
  const { NATS_CLUSTER_ID, NATS_CLIENT_ID, NATS_URL, MONGO_URI } = process.env;
  if (!NATS_CLUSTER_ID || !NATS_CLIENT_ID || !NATS_URL) {
    throw new Error('Missing NATS configuration in .env');
  }
  if (!MONGO_URI) {
    throw new Error('Missing MONGO_URI in .env');
  }

  // 2. Kết nối tới NATS Streaming
  await natsWrapper.connect(NATS_CLUSTER_ID, NATS_CLIENT_ID, NATS_URL);
  // Đóng kết nối gọn gàng khi process bị kill
  natsWrapper.client.on('close', () => {
    console.log('🔴 NATS connection closed!');
    process.exit();
  });
  process.on('SIGINT', () => natsWrapper.client.close());
  process.on('SIGTERM', () => natsWrapper.client.close());

  // 3. Kết nối MongoDB
  await mongoose.connect(MONGO_URI);
  console.log('🟢 Connected to MongoDB');

  // 4. Khởi server Express
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`⚡️ Server listening on port ${PORT}`);
  });
};

start().catch(err => {
  console.error(err);
  process.exit(1);
});
