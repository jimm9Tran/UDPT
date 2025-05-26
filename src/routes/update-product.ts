import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import { validateRequest, NotFoundError } from '@thasup-dev/common';

import { Product } from '../models/product';
import { ProductUpdatedPublisher } from '../events/publishers/ProductUpdatedPublisher';
import { natsWrapper } from '../NatsWrapper';

const router = express.Router();

router.put(
  '/api/products/:id',
  [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    body('image1').not().isEmpty().withMessage('Image1 is required'),
    body('category').not().isEmpty().withMessage('Category is required'),
    body('description').not().isEmpty().withMessage('Description is required'),
    body('countInStock').isInt({ gt: 0 }).withMessage('CountInStock must be greater than 0')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new NotFoundError();
    }

    const { title, price, image1, image2, image3, image4, colors, sizes, category, description, countInStock } = req.body;

    product.set({
      title,
      price,
      images: { image1, image2, image3, image4 },
      colors: colors || [],
      sizes: sizes || [],
      category,
      description,
      countInStock
    });

    await product.save();

    await new ProductUpdatedPublisher(natsWrapper.client).publish({
      id: product.id,
      title: product.title,
      price: product.price,
      userId: product.userId,
      image: product.images.image1,
      colors: product.colors,
      sizes: product.sizes,
      category: product.category,
      description: product.description,
      countInStock: product.countInStock,
      version: product.version
    });

    res.send(product);
  }
);

export { router as updateProductRouter };