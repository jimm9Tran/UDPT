import express from 'express';
import { natsWrapper } from './NatsWrapper';

const start = async () => {
  // 1. Kiểm tra các biến môi trường cần thiết
  if (!process.env.NATS_CLUSTER_ID) throw new Error('NATS_CLUSTER_ID must be defined');
  if (!process.env.NATS_CLIENT_ID)  throw new Error('NATS_CLIENT_ID must be defined');
  if (!process.env.NATS_URL)        throw new Error('NATS_URL must be defined');

  // 2. Kết nối đến NATS Streaming
  await natsWrapper.connect(
    process.env.NATS_CLUSTER_ID,
    process.env.NATS_CLIENT_ID,
    process.env.NATS_URL
  );

  // 3. (Tuỳ chọn) Đăng ký listener, ví dụ:
  // new OrderCreatedListener(natsWrapper.client).listen();
  // new OrderCancelledListener(natsWrapper.client).listen();

  // 4. Khởi chạy Express
  const app = express();
  app.use(express.json());
  // ... các route ở đây ...
  app.listen(3000, () => {
    console.log('⚡️ Server running on port 3000');
  });
};

start().catch(err => {
  console.error(err);
  process.exit(1);
});
