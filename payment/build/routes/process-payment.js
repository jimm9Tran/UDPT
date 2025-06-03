"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPaymentRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const common_1 = require("@jimm9tran/common");
const payment_1 = require("../models/payment");
const order_info_1 = require("../models/order-info");
const payment_2 = require("../types/payment");
const vnpay_1 = require("../helpers/vnpay");
const NatsWrapper_1 = require("../NatsWrapper");
const PaymentCreatedPublisher_1 = require("../events/publishers/PaymentCreatedPublisher");
const router = express_1.default.Router();
exports.processPaymentRouter = router;
// VNPay configuration
const vnpayConfig = {
    vnp_TmnCode: process.env.VNPAY_TMN_CODE,
    vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
    vnp_Url: process.env.VNPAY_URL,
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL
};
const vnpayHelper = new vnpay_1.VNPayHelper(vnpayConfig);
router.post('/api/payments/process/:orderId', common_1.requireAuth, [
    (0, express_validator_1.param)('orderId')
        .not()
        .isEmpty()
        .withMessage('Mã đơn hàng không được để trống'),
    (0, express_validator_1.body)('type')
        .isIn(['vnpay', 'cod'])
        .withMessage('Loại thanh toán không hợp lệ')
], common_1.validateRequest, async (req, res) => {
    const { orderId } = req.params;
    const { type, amount, ...paymentData } = req.body;
    console.log('Processing payment:', { orderId, type, amount, userId: req.currentUser.id });
    // Kiểm tra xem order có tồn tại không
    const orderInfo = await order_info_1.OrderInfo.findOne({ orderId });
    if (!orderInfo) {
        console.log('Order not found:', orderId);
        throw new common_1.NotFoundError();
    }
    // Kiểm tra xem user có quyền thanh toán order này không
    if (orderInfo.userId !== req.currentUser.id) {
        console.log('User not authorized for this order:', {
            userId: req.currentUser.id,
            orderUserId: orderInfo.userId
        });
        throw new common_1.NotFoundError();
    }
    // Kiểm tra xem đã có payment cho order này chưa
    const existingPayment = await payment_1.Payment.findOne({ orderId });
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
        // Tạo COD payment record với trạng thái completed ngay lập tức
        const payment = payment_1.Payment.build({
            orderId,
            stripeId: `cod_${vnpayTxnRef}`,
            vnpayTxnRef,
            amount: finalAmount,
            currency: 'VND',
            paymentMethod: payment_2.PaymentMethod.COD,
            status: payment_2.PaymentStatus.Success, // COD được coi như thành công ngay
            paidAt: new Date() // Set thời gian thanh toán
        });
        await payment.save();
        console.log('COD payment saved successfully');
        // Publish payment completed event
        await new PaymentCreatedPublisher_1.PaymentCreatedPublisher(NatsWrapper_1.natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId,
            vnpayTxnRef: payment.vnpayTxnRef || '',
            amount: payment.amount,
            currency: payment.currency,
            paymentMethod: payment.paymentMethod,
            status: payment.status,
            paidAt: payment.paidAt
        });
        console.log('COD payment event published');
        res.status(201).json({
            success: true,
            payment: {
                id: payment.id,
                orderId: payment.orderId,
                amount: payment.amount,
                currency: payment.currency,
                paymentMethod: payment.paymentMethod,
                status: payment.status,
                paidAt: payment.paidAt
            },
            message: 'COD payment processed successfully'
        });
    }
    else if (type === 'vnpay') {
        console.log('Processing VNPay payment...');
        // Generate unique reference
        const vnpayTxnRef = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Tạo payment record với trạng thái pending
        const payment = payment_1.Payment.build({
            orderId,
            stripeId: `vnpay_${vnpayTxnRef}`,
            vnpayTxnRef,
            amount: finalAmount,
            currency: 'VND',
            paymentMethod: payment_2.PaymentMethod.VNPay,
            status: payment_2.PaymentStatus.Pending
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
    }
    else {
        throw new common_1.BadRequestError('Unsupported payment type');
    }
});
