import express, { type Request, type Response } from 'express';
import { body, param } from 'express-validator';
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError
} from '@jimm9tran/common';

import { Payment } from '../models/payment';
import { OrderInfo } from '../models/order-info';
import { PaymentStatus, PaymentMethod } from '../types/payment';
import { VNPayHelper } from '../helpers/vnpay';
import { natsWrapper } from '../NatsWrapper';
import { PaymentCreatedPublisher } from '../events/publishers/PaymentCreatedPublisher';

const router = express.Router();

// VNPay configuration
const vnpayConfig = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE!,
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET!,
  vnp_Url: process.env.VNPAY_URL!,
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL!
};

const vnpayHelper = new VNPayHelper(vnpayConfig);

router.post(
  '/api/payments/process/:orderId',
  requireAuth,
  [
    param('orderId')
      .not()
      .isEmpty()
      .withMessage('Mã đơn hàng không được để trống'),
    body('type')
      .isIn(['vnpay', 'cod'])
      .withMessage('Loại thanh toán không hợp lệ')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { type, amount, ...paymentData } = req.body;

    console.log('Processing payment:', { orderId, type, amount, userId: req.currentUser!.id });

    // Kiểm tra xem order có tồn tại không
    const orderInfo = await OrderInfo.findOne({ orderId });
    if (!orderInfo) {
      console.log('Order not found:', orderId);
      throw new NotFoundError();
    }

    // Kiểm tra xem user có quyền thanh toán order này không
    if (orderInfo.userId !== req.currentUser!.id) {
      console.log('User not authorized for this order:', { 
        userId: req.currentUser!.id, 
        orderUserId: orderInfo.userId 
      });
      throw new NotFoundError();
    }

    // Kiểm tra xem đã có payment cho order này chưa
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment) {
      console.log('Payment already exists for order:', orderId);
      return res.status(200).json({ 
        success: true,
        payment: existingPayment,
        message: 'Payment already processed'
      });
    }

    const finalAmount = amount || orderInfo.totalPrice;
    
    if (type === 'cod') {
      console.log('Processing COD payment...');
      
      // Generate unique reference
      const vnpayTxnRef = `COD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Tạo COD payment record với trạng thái AwaitingDelivery để chờ xác nhận giao hàng
      const payment = Payment.build({
        orderId,
        stripeId: `cod_${vnpayTxnRef}`,
        vnpayTxnRef,
        amount: finalAmount,
        currency: 'VND',
        paymentMethod: PaymentMethod.COD,
        status: PaymentStatus.AwaitingDelivery, // COD chờ giao hàng và xác nhận thanh toán
        deliveryAddress: paymentData.deliveryAddress || 'Địa chỉ mặc định',
        phoneNumber: paymentData.phoneNumber || 'Chưa cung cấp'
      });

      await payment.save();
      console.log('COD payment saved successfully with AwaitingDelivery status');

      // Publish payment created event với trạng thái AwaitingDelivery
      await new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId,
        vnpayTxnRef: payment.vnpayTxnRef || '',
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: payment.status
      });

      console.log('COD payment event published with AwaitingDelivery status');

      res.status(201).json({
        success: true,
        payment: {
          id: payment.id,
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          status: payment.status,
          deliveryAddress: payment.deliveryAddress,
          phoneNumber: payment.phoneNumber
        },
        message: 'COD payment created successfully. Payment will be collected upon delivery.',
        instructions: 'Please prepare cash for payment when the delivery arrives.'
      });

    } else if (type === 'vnpay') {
      console.log('Processing VNPay payment...');
      
      // Generate unique reference
      const vnpayTxnRef = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Tạo payment record với trạng thái pending
      const payment = Payment.build({
        orderId,
        stripeId: `vnpay_${vnpayTxnRef}`,
        vnpayTxnRef,
        amount: finalAmount,
        currency: 'VND',
        paymentMethod: PaymentMethod.VNPay,
        status: PaymentStatus.Pending
      });

      await payment.save();
      console.log('VNPay payment record created');

      // Tạo VNPay payment URL
      const vnpayUrl = vnpayHelper.createPaymentUrl({
        orderId,
        amount: finalAmount,
        orderInfo: `Thanh toan don hang ${orderId}`,
        ipAddr: req.ip || '127.0.0.1'
      });

      res.status(201).json({
        success: true,
        payment: {
          id: payment.id,
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          status: payment.status
        },
        paymentUrl: vnpayUrl,
        message: 'VNPay payment URL generated successfully'
      });

    } else {
      throw new BadRequestError('Unsupported payment type');
    }
  }
);

export { router as processPaymentRouter };
