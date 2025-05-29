// src/routes/get-payment.ts

import express, { type Request, type Response } from 'express';
import { param } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  NotAuthorizedError
} from '@jimm9tran/common';

import { Payment } from '../models/payment';

const router = express.Router();

router.get(
  '/api/payments/:paymentId',
  requireAuth,
  [
    param('paymentId')
      .isMongoId()
      .withMessage('ID thanh toán không hợp lệ')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { paymentId } = req.params;

    // Tìm payment theo ID
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new NotFoundError();
    }

    // TODO: Kiểm tra quyền truy cập - chỉ cho phép user sở hữu order hoặc admin
    // Hiện tại chưa có thông tin userId trong payment model
    // Có thể thêm field userId hoặc join với order service

    res.send(payment);
  }
);

// Route lấy payment theo orderId
router.get(
  '/api/payments/order/:orderId',
  requireAuth,
  [
    param('orderId')
      .not()
      .isEmpty()
      .withMessage('Mã đơn hàng không được để trống')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    // Tìm payment theo orderId
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      throw new NotFoundError();
    }

    // TODO: Kiểm tra quyền truy cập tương tự như trên

    res.send(payment);
  }
);

export { router as getPaymentRouter };
