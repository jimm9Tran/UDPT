import express, { type Request, type Response } from 'express';
import { param } from 'express-validator';
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest
} from '@jimm9tran/common';

import { Order } from '../models/order';

const router = express.Router();

router.get(
  '/api/orders/:orderId',
  requireAuth,
  [param('orderId').isMongoId().withMessage('Id đơn hàng không hợp lệ')], // Kiểm tra orderId hợp lệ
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    // Tìm đơn hàng theo id
    const order = await Order.findById(orderId);

    // Nếu không tìm thấy đơn hàng thì báo lỗi
    if (order == null) {
      throw new NotFoundError();
    }

    // Chỉ admin hoặc chính chủ đơn hàng mới được truy cập đơn hàng này
    if (
      order.userId !== req.currentUser!.id &&
      !req.currentUser!.isAdmin
    ) {
      throw new NotAuthorizedError();
    }

    // Trả về thông tin đơn hàng
    res.status(200).send(order);
  }
);

export { router as getOrderRouter };
