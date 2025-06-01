// src/routes/bestseller.ts

import express, { type Request, type Response } from 'express';

import { Product } from '../models/product';

const router = express.Router();

router.get('/api/bestsellers', async (req: Request, res: Response) => {
  try {
    const products = await Product.find({}).sort({ rating: -1, createdAt: -1 }).limit(10);
    
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { router as bestsellerRouter };
