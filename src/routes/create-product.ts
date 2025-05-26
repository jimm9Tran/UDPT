import express, { type Request, type Response } from 'express';
import { body } from 'express-validator';
import { /* requireAuth, adminUser, */ validateRequest } from '@thasup-dev/common';

import { Product } from '../models/product';
import { ProductCreatedPublisher } from '../events/publishers/ProductCreatedPublisher';
import { natsWrapper } from '../NatsWrapper';
import type { ProductAttrs } from '../types/product';

const router = express.Router();

router.post(
  '/api/products',
  /* requireAuth,
  adminUser, */
 validateRequest,
  async (req: Request, res: Response) => {
    try {
      console.log('Request body:', req.body);
      const {
        title,
        price,
        image1,
        image2,
        image3,
        image4,
        colors,
        sizes,
        brand,
        category,
        material,
        description,
        reviews,
        numReviews,
        rating,
        countInStock
      }: {
        image1: string
        image2: string
        image3: string
        image4: string
      } & ProductAttrs = req.body;

      // Chuyển đổi mảng colors và sizes thành string
      const colorsArray = Array.isArray(colors) ? colors : [colors];
      const sizesString = Array.isArray(sizes) ? sizes.join(',') : sizes;

      const product = Product.build({
        title,
        price,
        userId: 'test-user-id',
        images: {
          image1,
          image2,
          image3,
          image4
        },
        colors: colorsString,
        sizes: sizesString,
        brand,
        category,
        material,
        description,
        reviews,
        numReviews,
        rating,
        countInStock,
        isReserved: false
      });

      console.log('Product before save:', product);
      await product.save();

      await new ProductCreatedPublisher(natsWrapper.client).publish({
        id: product.id,
        title: product.title,
        price: product.price,
        userId: product.userId,
        image: product.images.image1,
        colors: product.colors,
        sizes: product.sizes,
        brand: product.brand,
        category: product.category,
        material: product.material,
        description: product.description,
        numReviews: product.numReviews,
        rating: product.rating,
        countInStock: product.countInStock,
        isReserved: product.isReserved,
        version: product.version
      });

      res.status(201).send(product);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }
);