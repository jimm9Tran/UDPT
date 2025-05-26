import express from 'express';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { NotFoundError, errorHandler, currentUser } from '@jimm9tran/common';
import { natsWrapper } from './NatsWrapper';
import { OrderCreatedPublisher } from './events/publishers/OrderCreatedPublisher';
import { OrderStatus } from '@jimm9tran/common';

const app = express();
app.use(json());

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.send({ status: 'ok' });
});

// 2. Publish demo OrderCreated event
app.post('/api/publish', async (req, res) => {
  // Bạn có thể lấy dữ liệu từ req.body, ở đây demo tĩnh
  const payload = {
    id: 'order-' + Date.now(),
    status: OrderStatus.Created,
    userId: 'user123',
    expiresAt: new Date(),
    version: 0,
    cart: [
      {
        userId: 'user123',
        title: 'Sample Product',
        qty: 2,
        color: 'red',
        size: 'M',
        image: 'https://via.placeholder.com/150',
        price: 50,
        countInStock: 100,
        discount: 0,
        productId: 'prod-abc'
      }
    ],
    paymentMethod: 'creditcard',
    itemsPrice: 100,
    shippingPrice: 10,
    taxPrice: 5,
    totalPrice: 115,
    isPaid: false,
    isDelivered: false
  };

  await new OrderCreatedPublisher(natsWrapper.client).publish(payload);
  res.send({ success: true, published: payload });
});

export { app };
