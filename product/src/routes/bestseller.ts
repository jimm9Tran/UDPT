// src/routes/bestseller.ts

import express, { type Request, type Response } from 'express';
import { NotFoundError } from '@jimm9tran/common';

import { Product } from '../models/product';

const router = express.Router();

router.get('/api/products/bestseller', async (req: Request, res: Response) => {
  const products = await Product.find({}).sort({ rating: -1 });

  if (products.length < 1) {
    throw new NotFoundError();
  }

  res.send(products);
});

export { router as bestsellerRouter };
