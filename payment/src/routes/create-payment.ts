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
import { OrderInfo } from '../models/order-info';
import { PaymentStatus, PaymentMethod } from '../types/payment';
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
    body('paymentMethod')
      .isIn(['VNPay', 'COD'])
      .withMessage('Phương thức thanh toán phải là VNPay hoặc COD'),
    body('bankCode')
      .optional()
      .isString()
      .withMessage('Mã ngân hàng phải là chuỗi')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId, amount, bankCode, paymentMethod = 'VNPay' } = req.body;
    const userId = req.currentUser!.id;

    console.log('Payment request - User ID:', userId);
    console.log('Payment request - Order ID:', orderId);
    console.log('Payment request - Amount:', amount);
    console.log('Payment request - Method:', paymentMethod);

    // Kiểm tra order có tồn tại và thuộc về user hiện tại không
    const orderInfo = await OrderInfo.findOne({ _id: orderId });
    console.log('Found order info:', orderInfo ? 'Yes' : 'No');
    if (orderInfo) {
      console.log('Order userId:', orderInfo.userId);
      console.log('Request userId:', userId);
    }
    
    if (!orderInfo) {
      throw new NotFoundError();
    }

    if (orderInfo.userId !== userId) {
      console.log('Authorization failed - User IDs do not match');
      throw new NotAuthorizedError();
    }
    console.log('User authorization passed');

    if (orderInfo.status === 'cancelled') {
      console.log('Order is cancelled');
      throw new BadRequestError('Đơn hàng đã bị hủy, không thể thanh toán');
    }

    if (orderInfo.status === 'completed') {
      console.log('Order is already completed');
      throw new BadRequestError('Đơn hàng đã được thanh toán');
    }
    console.log('Order status check passed, status:', orderInfo.status);

    // Kiểm tra số tiền có khớp với đơn hàng không
    console.log('Amount check - Request:', amount, 'Order:', orderInfo.totalPrice);
    if (amount !== orderInfo.totalPrice) {
      console.log('Amount mismatch error');
      throw new BadRequestError(`Số tiền thanh toán (${amount}) không khớp với tổng tiền đơn hàng (${orderInfo.totalPrice})`);
    }
    console.log('Amount validation passed');

    // Kiểm tra xem đã có payment cho order này chưa
    console.log('Checking for existing payment...');
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment) {
      console.log('Existing payment found, throwing error');
      throw new BadRequestError('Đơn hàng này đã có giao dịch thanh toán');
    }
    console.log('No existing payment found');

    // Tạo mã giao dịch duy nhất
    const vnpayTxnRef = `${orderId}_${Date.now()}`;
    console.log('Generated transaction reference:', vnpayTxnRef);

    // Xử lý thanh toán COD
    if (paymentMethod === 'COD') {
      console.log('Processing COD payment...');
      
      // Tạo COD payment record với trạng thái pending
      const payment = Payment.build({
        orderId,
        stripeId: `cod_${vnpayTxnRef}`,
        vnpayTxnRef,
        amount,
        currency: 'VND',
        paymentMethod: PaymentMethod.COD,
        status: PaymentStatus.Pending
      });

      await payment.save();
      console.log('COD payment saved successfully');

      // COD payment không cần redirect, chỉ cần thông báo thành công
      res.status(201).send({
        id: payment.id,
        orderId: payment.orderId,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: 'COD',
        vnpayTxnRef: payment.vnpayTxnRef,
        message: "Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng (COD).",
        instructions: "Vui lòng chuẩn bị tiền mặt để thanh toán khi shipper giao hàng."
      });
      return;
    }

    // Tạo payment record với trạng thái pending
    console.log('Creating payment record...');
    const payment = Payment.build({
      orderId,
      stripeId: '', // Không sử dụng Stripe trong VNPay
      vnpayTxnRef,
      amount,
      currency: 'VND',
      paymentMethod: PaymentMethod.VNPay,
      status: PaymentStatus.Pending
    });

    console.log('Saving payment to database...');
    await payment.save();
    console.log('Payment saved successfully');

    try {
      console.log('Creating MOCK payment for demo purposes...');
      
      // Mock Payment URL for demo
      const mockPaymentUrl = `${process.env.CLIENT_URL}/payment-demo?orderId=${orderId}&amount=${amount}&paymentId=${payment.id}&txnRef=${payment.vnpayTxnRef}`;
      
      console.log('Mock payment URL created:', mockPaymentUrl);

      // Simulate successful payment processing after 3 seconds
      setTimeout(async () => {
        try {
          console.log(`Auto-completing demo payment ${payment.id}...`);
          
          // Update payment status to completed
          const updatedPayment = await Payment.findById(payment.id);
          if (updatedPayment && updatedPayment.status === PaymentStatus.Pending) {
            updatedPayment.set({ 
              status: PaymentStatus.Success,
              stripeId: `demo_${payment.vnpayTxnRef}`,
              paidAt: new Date()
            });
            await updatedPayment.save();
            
            // Publish payment completed event
            await new PaymentCreatedPublisher(natsWrapper.client).publish({
              id: updatedPayment.id,
              orderId: updatedPayment.orderId,
              stripeId: updatedPayment.stripeId!
            });
            
            console.log(`✅ Demo payment ${payment.id} completed successfully!`);
          }
        } catch (autoCompleteError) {
          console.error('Error auto-completing demo payment:', autoCompleteError);
        }
      }, 3000);

      console.log(`🎯 DEMO: Payment created for order ${orderId}, payment ID: ${payment.id}`);

      res.status(201).send({
        id: payment.id,
        orderId: payment.orderId,
        amount: payment.amount,
        status: payment.status,
        paymentUrl: mockPaymentUrl,
        vnpayTxnRef: payment.vnpayTxnRef,
        demoMode: true,
        message: "Demo payment - sẽ tự động hoàn thành sau 3 giây",
        instructions: "Trong demo thực tế, bạn sẽ được chuyển đến trang thanh toán"
      });
    } catch (error) {
      console.log('Error in mock payment creation:', error);
      // If error in mock payment, update status to failed
      payment.set({ status: PaymentStatus.Failed });
      await payment.save();
      
      throw new BadRequestError('Không thể tạo mock payment cho demo');
    }
  }
);

export { router as createPaymentRouter };
