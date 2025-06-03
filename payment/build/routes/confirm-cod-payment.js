"use strict";
// src/routes/confirm-cod-payment.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmCODPaymentRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const common_1 = require("@jimm9tran/common");
const payment_1 = require("../models/payment");
const payment_2 = require("../types/payment");
const NatsWrapper_1 = require("../NatsWrapper");
const PaymentCreatedPublisher_1 = require("../events/publishers/PaymentCreatedPublisher");
const router = express_1.default.Router();
exports.confirmCODPaymentRouter = router;
// Route for delivery person or system to confirm COD payment received
router.post('/api/payments/cod/confirm', common_1.requireAuth, [
    (0, express_validator_1.body)('paymentId')
        .not()
        .isEmpty()
        .withMessage('Payment ID không được để trống'),
    (0, express_validator_1.body)('confirmationCode')
        .optional()
        .isString()
        .withMessage('Mã xác nhận phải là chuỗi')
], common_1.validateRequest, async (req, res) => {
    const { paymentId, confirmationCode } = req.body;
    const userId = req.currentUser.id;
    console.log('COD Confirmation request - User ID:', userId);
    console.log('COD Confirmation request - Payment ID:', paymentId);
    // Find the payment
    const payment = await payment_1.Payment.findById(paymentId);
    if (!payment) {
        throw new common_1.NotFoundError();
    }
    // Check if it's a COD payment
    if (payment.paymentMethod !== payment_2.PaymentMethod.COD) {
        throw new common_1.BadRequestError('Chỉ có thể xác nhận thanh toán COD');
    }
    // Check current status
    if (payment.status === payment_2.PaymentStatus.Success) {
        throw new common_1.BadRequestError('Thanh toán này đã được xác nhận rồi');
    }
    if (payment.status === payment_2.PaymentStatus.Cancelled || payment.status === payment_2.PaymentStatus.Failed) {
        throw new common_1.BadRequestError('Không thể xác nhận thanh toán đã bị hủy hoặc thất bại');
    }
    // Update payment status to success
    payment.set({
        status: payment_2.PaymentStatus.Success,
        paidAt: new Date(),
        vnpayResponseCode: confirmationCode || 'COD_CONFIRMED'
    });
    await payment.save();
    // Publish payment success event
    await new PaymentCreatedPublisher_1.PaymentCreatedPublisher(NatsWrapper_1.natsWrapper.client).publish({
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
});
// Route to cancel COD payment (if delivery failed)
router.post('/api/payments/cod/cancel', common_1.requireAuth, [
    (0, express_validator_1.body)('paymentId')
        .not()
        .isEmpty()
        .withMessage('Payment ID không được để trống'),
    (0, express_validator_1.body)('reason')
        .optional()
        .isString()
        .withMessage('Lý do hủy phải là chuỗi')
], common_1.validateRequest, async (req, res) => {
    const { paymentId, reason } = req.body;
    const userId = req.currentUser.id;
    const payment = await payment_1.Payment.findById(paymentId);
    if (!payment) {
        throw new common_1.NotFoundError();
    }
    if (payment.paymentMethod !== payment_2.PaymentMethod.COD) {
        throw new common_1.BadRequestError('Chỉ có thể hủy thanh toán COD');
    }
    if (payment.status === payment_2.PaymentStatus.Success) {
        throw new common_1.BadRequestError('Không thể hủy thanh toán đã hoàn thành');
    }
    // Update payment status to cancelled
    payment.set({
        status: payment_2.PaymentStatus.Cancelled,
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
});
