// src/routes/create-cod-payment.ts

import express, { type Request, type Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError
} from '@jimm9tran/common';

import { Payment } from '../models/payment';
import { OrderInfo } from '../models/order-info';
import { PaymentStatus, PaymentMethod } from '../types/payment';
import { natsWrapper } from '../NatsWrapper';
import { PaymentCreatedPublisher } from '../events/publishers/PaymentCreatedPublisher';

const router = express.Router();

router.post(
  '/api/payments/cod',
  requireAuth,
  [
    body('orderId')
      .not()
      .isEmpty()
      .withMessage('Mã đơn hàng không được để trống'),
    body('amount')
      .isFloat({ gt: 0 })
      .withMessage('Số tiền phải lớn hơn 0'),
    body('deliveryAddress')
      .not()
      .isEmpty()
      .isLength({ min: 10 })
      .withMessage('Địa chỉ giao hàng không được để trống và phải ít nhất 10 ký tự'),
    body('phoneNumber')
      .not()
      .isEmpty()
      .matches(/^(\+84|84|0[3|5|7|8|9])[0-9]{8,9}$/)
      .withMessage('Số điện thoại không hợp lệ')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId, amount, deliveryAddress, phoneNumber } = req.body;
    const userId = req.currentUser!.id;

    console.log('COD Payment request - User ID:', userId);
    console.log('COD Payment request - Order ID:', orderId);
    console.log('COD Payment request - Amount:', amount);
    console.log('COD Payment request - Delivery Address:', deliveryAddress);

    // Kiểm tra order có tồn tại và thuộc về user hiện tại không
    const orderInfo = await OrderInfo.findOne({ _id: orderId });
    
    if (!orderInfo) {
      throw new NotFoundError();
    }

    if (orderInfo.userId !== userId) {
      throw new NotAuthorizedError();
    }

    if (orderInfo.status === 'cancelled') {
      throw new BadRequestError('Đơn hàng đã bị hủy, không thể thanh toán');
    }

    if (orderInfo.status === 'completed') {
      throw new BadRequestError('Đơn hàng đã được thanh toán');
    }

    // Kiểm tra số tiền có khớp với đơn hàng không
    if (amount !== orderInfo.totalPrice) {
      throw new BadRequestError(`Số tiền thanh toán (${amount}) không khớp với tổng tiền đơn hàng (${orderInfo.totalPrice})`);
    }

    // Kiểm tra xem đã có payment cho order này chưa
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment) {
      throw new BadRequestError('Đơn hàng này đã có giao dịch thanh toán');
    }

    // Tạo COD payment record
    const payment = Payment.build({
      orderId,
      amount,
      currency: 'VND',
      paymentMethod: PaymentMethod.COD,
      status: PaymentStatus.AwaitingDelivery,
      deliveryAddress,
      phoneNumber
    });

    await payment.save();

    // Publish payment created event for COD
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: `cod_${payment.id}` // Use COD identifier
    });

    console.log(`✅ COD Payment created for order ${orderId}, payment ID: ${payment.id}`);

    res.status(201).send({
      id: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      deliveryAddress: payment.deliveryAddress,
      phoneNumber: payment.phoneNumber,
      message: "Đơn hàng COD đã được tạo thành công. Bạn sẽ thanh toán khi nhận hàng.",
      instructions: "Vui lòng chuẩn bị tiền mặt khi shipper giao hàng."
    });
  }
);

export { router as createCODPaymentRouter };
