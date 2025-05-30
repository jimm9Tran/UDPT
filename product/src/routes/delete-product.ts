// src/routes/delete-product.ts

import express, { type Request, type Response } from 'express';
import { param } from 'express-validator';
import {
  requireAuth,
  adminUser,
  validateRequest,
  NotFoundError
} from '@jimm9tran/common';

import { Product } from '../models/product';
import { ProductDeletedPublisher } from '../events/publishers/ProductDeletedPublisher';
import { natsWrapper } from '../NatsWrapper';

const router = express.Router();

router.delete(
  '/api/products/:productId',
  requireAuth,
  adminUser,
  [param('productId').isMongoId().withMessage('Invalid MongoDB ObjectId')],
  validateRequest,
  async (req: Request, res: Response) => {
    // Xóa trực tiếp bằng findByIdAndDelete
    const deletedProduct = await Product.findByIdAndDelete(req.params.productId);

    // Kiểm tra tồn tại
    if (!deletedProduct) {
      throw new NotFoundError();
    }

    // Publish event thông báo đã xóa
    await new ProductDeletedPublisher(natsWrapper.client).publish({
      id: deletedProduct.id,
      version: deletedProduct.version
    });

    res.status(200).send({});
  }
);

export { router as deleteProductRouter };
