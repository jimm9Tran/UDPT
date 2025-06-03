"use strict";
// src/routes/create-cod-payment.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCODPaymentRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const common_1 = require("@jimm9tran/common");
const payment_1 = require("../models/payment");
const order_info_1 = require("../models/order-info");
const payment_2 = require("../types/payment");
const NatsWrapper_1 = require("../NatsWrapper");
const PaymentCreatedPublisher_1 = require("../events/publishers/PaymentCreatedPublisher");
const router = express_1.default.Router();
exports.createCODPaymentRouter = router;
router.post('/api/payments/cod', common_1.requireAuth, [
    (0, express_validator_1.body)('orderId')
        .not()
        .isEmpty()
        .withMessage('Mã đơn hàng không được để trống'),
    (0, express_validator_1.body)('amount')
        .isFloat({ gt: 0 })
        .withMessage('Số tiền phải lớn hơn 0'),
    (0, express_validator_1.body)('deliveryAddress')
        .not()
        .isEmpty()
        .isLength({ min: 10 })
        .withMessage('Địa chỉ giao hàng không được để trống và phải ít nhất 10 ký tự'),
    (0, express_validator_1.body)('phoneNumber')
        .not()
        .isEmpty()
        .matches(/^(\+84|84|0[3|5|7|8|9])[0-9]{8,9}$/)
        .withMessage('Số điện thoại không hợp lệ')
], common_1.validateRequest, async (req, res) => {
    const { orderId, amount, deliveryAddress, phoneNumber } = req.body;
    const userId = req.currentUser.id;
    console.log('COD Payment request - User ID:', userId);
    console.log('COD Payment request - Order ID:', orderId);
    console.log('COD Payment request - Amount:', amount);
    console.log('COD Payment request - Delivery Address:', deliveryAddress);
    // Kiểm tra order có tồn tại và thuộc về user hiện tại không
    const orderInfo = await order_info_1.OrderInfo.findOne({ _id: orderId });
    if (!orderInfo) {
        throw new common_1.NotFoundError();
    }
    if (orderInfo.userId !== userId) {
        throw new common_1.NotAuthorizedError();
    }
    if (orderInfo.status === 'cancelled') {
        throw new common_1.BadRequestError('Đơn hàng đã bị hủy, không thể thanh toán');
    }
    if (orderInfo.status === 'completed') {
        throw new common_1.BadRequestError('Đơn hàng đã được thanh toán');
    }
    // Kiểm tra số tiền có khớp với đơn hàng không
    if (amount !== orderInfo.totalPrice) {
        throw new common_1.BadRequestError(`Số tiền thanh toán (${amount}) không khớp với tổng tiền đơn hàng (${orderInfo.totalPrice})`);
    }
    // Kiểm tra xem đã có payment cho order này chưa
    const existingPayment = await payment_1.Payment.findOne({ orderId });
    if (existingPayment) {
        throw new common_1.BadRequestError('Đơn hàng này đã có giao dịch thanh toán');
    }
    // Tạo COD payment record
    const payment = payment_1.Payment.build({
        orderId,
        amount,
        currency: 'VND',
        paymentMethod: payment_2.PaymentMethod.COD,
        status: payment_2.PaymentStatus.AwaitingDelivery,
        deliveryAddress,
        phoneNumber
    });
    await payment.save();
    // Publish payment created event for COD
    await new PaymentCreatedPublisher_1.PaymentCreatedPublisher(NatsWrapper_1.natsWrapper.client).publish({
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
});
