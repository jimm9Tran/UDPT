// src/app.ts

import express from 'express';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { createProductRouter } from './routes/create-product';
import { currentUser } from '@jimm9tran/common';
import { getAllProductsRouter } from './routes/get-all-products';
import { getProductRouter } from './routes/get-product';
import { deleteProductRouter } from './routes/delete-product';
import { updateProductRouter } from './routes/update-product';

const app = express();
app.use(json());

app.use(
  cookieSession({
    signed: false,
    // secure: process.env.NODE_ENV === 'production'
    secure: false, // For local development, set to false
    httpOnly: true,
  })
);

app.use(currentUser)

app.use(createProductRouter);
app.use(getAllProductsRouter)
app.use(getProductRouter);
app.use(deleteProductRouter);
app.use(updateProductRouter);

// Xử lý lỗi 404 cho các route không tồn tại
app.all('*', async (req, res) => {
  res.status(404).send({ message: 'Not Found' });
});

export { app };
