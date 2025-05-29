// src/routes/create-payment.ts

import express, { type Request, type Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus
} from '@jimm9tran/common';

import { Payment } from '../models/payment';
import { PaymentStatus } from '../types/payment';
import { VNPayHelper } from '../helpers/vnpay';
import { natsWrapper } from '../NatsWrapper';
import { PaymentCreatedPublisher } from '../events/publishers/PaymentCreatedPublisher';

const router = express.Router();

// Khởi tạo VNPay helper với config từ env
const vnpayConfig = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE!,
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET!,
  vnp_Url: process.env.VNPAY_URL!,
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL!
};

const vnpayHelper = new VNPayHelper(vnpayConfig);

router.post(
  '/api/payments',
  requireAuth,
  [
    body('orderId')
      .not()
      .isEmpty()
      .withMessage('Mã đơn hàng không được để trống'),
    body('amount')
      .isFloat({ gt: 0 })
      .withMessage('Số tiền phải lớn hơn 0'),
    body('bankCode')
      .optional()
      .isString()
      .withMessage('Mã ngân hàng phải là chuỗi')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId, amount, bankCode } = req.body;
    const userId = req.currentUser!.id;

    // TODO: Kiểm tra order có tồn tại và thuộc về user hiện tại không
    // Ở đây chúng ta có thể gọi API của Order Service hoặc lưu thông tin order
    // trong Payment Service khi nhận OrderCreated event

    // Kiểm tra xem đã có payment cho order này chưa
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment) {
      throw new BadRequestError('Đơn hàng này đã có giao dịch thanh toán');
    }

    // Tạo mã giao dịch duy nhất
    const vnpayTxnRef = `${orderId}_${Date.now()}`;

    // Tạo payment record với trạng thái pending
    const payment = Payment.build({
      orderId,
      stripeId: '', // Không sử dụng Stripe trong VNPay
      vnpayTxnRef,
      amount,
      currency: 'VND',
      paymentMethod: 'VNPay',
      status: PaymentStatus.Pending
    });

    await payment.save();

    try {
      // Lấy IP của client
      const ipAddr = req.ip || req.connection.remoteAddress || '127.0.0.1';

      // Tạo URL thanh toán VNPay
      const paymentUrl = vnpayHelper.createPaymentUrl({
        orderId: payment.id,
        amount,
        bankCode,
        orderInfo: `Thanh toán đơn hàng ${orderId}`,
        ipAddr
      });

      console.log(`Đã tạo payment cho đơn hàng ${orderId}, payment ID: ${payment.id}`);

      res.status(201).send({
        id: payment.id,
        orderId: payment.orderId,
        amount: payment.amount,
        status: payment.status,
        paymentUrl,
        vnpayTxnRef: payment.vnpayTxnRef
      });
    } catch (error) {
      // Nếu có lỗi khi tạo URL VNPay, cập nhật status thành failed
      payment.set({ status: PaymentStatus.Failed });
      await payment.save();
      
      throw new BadRequestError('Không thể tạo URL thanh toán VNPay');
    }
  }
);

export { router as createPaymentRouter };
