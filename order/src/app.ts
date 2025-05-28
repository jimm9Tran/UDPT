import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { NotFoundError, errorHandler, currentUser } from '@jimm9tran/common';

import { showMyOrderRouter } from './routes/show-my-order';
import { showAllOrderRouter } from './routes/show-all-order';
import { cancelOrderRouter } from './routes/cancel-order';
import { getOrderRouter } from './routes/get-order';
import { createOrderRouter } from './routes/create-order';
import { deliverOrderRouter } from './routes/deliver-order';
import { showProductRouter } from './routes/show-product';

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    // secure: process.env.NODE_ENV === 'production'
    secure: false, // For local development, set to false
    httpOnly: true,
  })
);
app.use(currentUser);

app.use(showProductRouter);
app.use(showMyOrderRouter);
app.use(getOrderRouter);
app.use(deliverOrderRouter);
app.use(cancelOrderRouter);
app.use(showAllOrderRouter);
app.use(createOrderRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
