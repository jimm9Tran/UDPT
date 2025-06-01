// src/app.ts

import express, { type Request, type Response } from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@jimm9tran/common';

import { createPaymentRouter } from './routes/create-payment';
import { createCODPaymentRouter } from './routes/create-cod-payment';
import { confirmCODPaymentRouter } from './routes/confirm-cod-payment';
import { vnpayCallbackRouter } from './routes/vnpay-callback';
import { getPaymentRouter } from './routes/get-payment';
import { healthRouter } from './routes/health';

const app = express();
app.set('trust proxy', true);
app.use(json());

// Health check first (no auth required)
app.use(healthRouter);

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
  })
);
app.use(currentUser);

// Routes
app.use(createPaymentRouter);
app.use(createCODPaymentRouter);
app.use(confirmCODPaymentRouter);
app.use(vnpayCallbackRouter);
app.use(getPaymentRouter);
app.use(healthRouter);

app.all('*', async (req: Request, res: Response) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
