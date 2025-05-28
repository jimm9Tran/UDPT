// src/routes/get-product.ts

import express, { type Request, type Response } from 'express';
import { param } from 'express-validator';
import { NotFoundError, validateRequest } from '@jimm9tran/common';

import { Product } from '../models/product';

const router = express.Router();

router.get(
  '/api/products/:productId',
  // Kiểm tra productId có đúng định dạng MongoDB ObjectId không
  [param('productId').isMongoId().withMessage('Id sản phẩm không hợp lệ')],
  validateRequest,
  async (req: Request, res: Response) => {
    // Tìm sản phẩm theo id từ database
    const product = await Product.findById(req.params.productId);

    // Nếu không tìm thấy sản phẩm thì trả về lỗi
    if (product == null) {
      throw new NotFoundError();
    }

    // Trả về thông tin sản phẩm nếu tìm thấy
    res.send(product);
  }
);

export { router as getProductRouter };
