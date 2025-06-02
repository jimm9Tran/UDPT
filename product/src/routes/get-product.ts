// src/routes/get-product.ts

import express, { type Request, type Response } from 'express';
import { param } from 'express-validator';
import { NotFoundError, validateRequest, BadRequestError } from '@jimm9tran/common';

import { Product } from '../models/product';

const router = express.Router();

router.get(
  '/api/products/:productId',
  // Kiểm tra productId có đúng định dạng MongoDB ObjectId không
  [param('productId').isMongoId().withMessage('Id sản phẩm không hợp lệ')],
  validateRequest,
  async (req: Request, res: Response) => {
    let product;
    try {
      // Tìm sản phẩm theo id và trả về plain JS object để tránh validation errors
      product = await Product.findById(req.params.productId).lean();
    } catch (err) {
      throw new BadRequestError('Error retrieving product');
    }
    // Nếu không tìm thấy sản phẩm thì trả về lỗi
    if (!product) {
      throw new NotFoundError();
    }
    // Trả về thông tin sản phẩm
    res.send(product);
  }
);

export { router as getProductRouter };
