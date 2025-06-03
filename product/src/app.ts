// src/app.ts

import express from 'express';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import 'express-async-errors';

import { createProductRouter } from './routes/create-product';
import { currentUser, errorHandler } from '@jimm9tran/common';
import { getAllProductsRouter } from './routes/get-all-products';
import { getProductRouter } from './routes/get-product';
import { deleteProductRouter } from './routes/delete-product';
import { updateProductRouter } from './routes/update-product';
import { bestsellerRouter } from './routes/bestseller';
import { healthRouter } from './routes/product-health';
import { checkInventoryRouter } from './routes/check-inventory';
import { cleanupReservationsRouter } from './routes/cleanup-reservations';
import { seedProductsRouter } from './routes/seed-products';
import { reserveInventoryRouter } from './routes/reserve-inventory';
import { releaseInventoryRouter } from './routes/release-inventory';
import { commitInventoryRouter } from './routes/commit-inventory';
import { cleanupExpiredReservationsRouter } from './routes/cleanup-expired-reservations';

const app = express();
app.use(json());

// Health check first (no auth required)
app.use(healthRouter);

app.use(
  cookieSession({
    signed: false,
    // secure: process.env.NODE_ENV === 'production'
    secure: false, // For local development, set to false
    httpOnly: true,
  })
);

app.use(currentUser);

app.use(bestsellerRouter); // Đặt trước getProductRouter
app.use(createProductRouter);
app.use(getAllProductsRouter)
app.use(getProductRouter); // Đặt sau các route cụ thể
app.use(deleteProductRouter);
app.use(updateProductRouter);
app.use(checkInventoryRouter);
app.use(cleanupReservationsRouter);
app.use(reserveInventoryRouter);
app.use(releaseInventoryRouter);
app.use(commitInventoryRouter);
app.use(cleanupExpiredReservationsRouter);
app.use(seedProductsRouter);
app.use(healthRouter)

// Xử lý lỗi 404 cho các route không tồn tại
app.all('*', async (req, res) => {
  res.status(404).send({ message: 'Not Found' });
});

// Error handling middleware
app.use(errorHandler);

export { app };
