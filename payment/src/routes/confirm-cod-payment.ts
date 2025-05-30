// src/routes/confirm-cod-payment.ts

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
import { PaymentStatus, PaymentMethod } from '../types/payment';
import { natsWrapper } from '../NatsWrapper';
import { PaymentCreatedPublisher } from '../events/publishers/PaymentCreatedPublisher';

const router = express.Router();

// Route for delivery person or system to confirm COD payment received
router.post(
  '/api/payments/cod/confirm',
  requireAuth,
  [
    body('paymentId')
      .not()
      .isEmpty()
      .withMessage('Payment ID không được để trống'),
    body('confirmationCode')
      .optional()
      .isString()
      .withMessage('Mã xác nhận phải là chuỗi')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { paymentId, confirmationCode } = req.body;
    const userId = req.currentUser!.id;

    console.log('COD Confirmation request - User ID:', userId);
    console.log('COD Confirmation request - Payment ID:', paymentId);

    // Find the payment
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      throw new NotFoundError();
    }

    // Check if it's a COD payment
    if (payment.paymentMethod !== PaymentMethod.COD) {
      throw new BadRequestError('Chỉ có thể xác nhận thanh toán COD');
    }

    // Check current status
    if (payment.status === PaymentStatus.Success) {
      throw new BadRequestError('Thanh toán này đã được xác nhận rồi');
    }

    if (payment.status === PaymentStatus.Cancelled || payment.status === PaymentStatus.Failed) {
      throw new BadRequestError('Không thể xác nhận thanh toán đã bị hủy hoặc thất bại');
    }

    // Update payment status to success
    payment.set({
      status: PaymentStatus.Success,
      paidAt: new Date(),
      vnpayResponseCode: confirmationCode || 'COD_CONFIRMED'
    });

    await payment.save();

    // Publish payment success event
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: `cod_confirmed_${payment.id}`
    });

    console.log(`✅ COD Payment confirmed for payment ID: ${paymentId}`);

    res.status(200).send({
      id: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      paidAt: payment.paidAt,
      message: "Thanh toán COD đã được xác nhận thành công"
    });
  }
);

// Route to cancel COD payment (if delivery failed)
router.post(
  '/api/payments/cod/cancel',
  requireAuth,
  [
    body('paymentId')
      .not()
      .isEmpty()
      .withMessage('Payment ID không được để trống'),
    body('reason')
      .optional()
      .isString()
      .withMessage('Lý do hủy phải là chuỗi')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { paymentId, reason } = req.body;
    const userId = req.currentUser!.id;

    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      throw new NotFoundError();
    }

    if (payment.paymentMethod !== PaymentMethod.COD) {
      throw new BadRequestError('Chỉ có thể hủy thanh toán COD');
    }

    if (payment.status === PaymentStatus.Success) {
      throw new BadRequestError('Không thể hủy thanh toán đã hoàn thành');
    }

    // Update payment status to cancelled
    payment.set({
      status: PaymentStatus.Cancelled,
      vnpayResponseCode: reason || 'COD_CANCELLED'
    });

    await payment.save();

    console.log(`❌ COD Payment cancelled for payment ID: ${paymentId}, reason: ${reason}`);

    res.status(200).send({
      id: payment.id,
      orderId: payment.orderId,
      status: payment.status,
      message: "Thanh toán COD đã được hủy",
      reason: reason
    });
  }
);

export { router as confirmCODPaymentRouter };
