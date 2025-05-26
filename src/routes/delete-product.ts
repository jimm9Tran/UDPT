import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import { validateRequest, NotFoundError } from '@thasup-dev/common';

import { Product } from '../models/product';
import { ProductDeletedPublisher } from '../events/publishers/ProductDeletedPublisher';
import { natsWrapper } from '../NatsWrapper';

const router = express.Router();

router.delete(
  '/api/products/:id',
  [param('id').isMongoId().withMessage('Invalid product ID')],
  validateRequest,
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new NotFoundError();
    }

    await product.remove();

    await new ProductDeletedPublisher(natsWrapper.client).publish({
      id: product.id,
      version: product.version
    });

    res.status(204).send();
  }
);

export { router as deleteProductRouter };