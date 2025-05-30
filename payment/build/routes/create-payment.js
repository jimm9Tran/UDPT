"use strict";
// src/routes/create-payment.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const common_1 = require("@jimm9tran/common");
const payment_1 = require("../models/payment");
const order_info_1 = require("../models/order-info");
const payment_2 = require("../types/payment");
const vnpay_1 = require("../helpers/vnpay");
const router = express_1.default.Router();
exports.createPaymentRouter = router;
// Khởi tạo VNPay helper với config từ env
const vnpayConfig = {
    vnp_TmnCode: process.env.VNPAY_TMN_CODE,
    vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
    vnp_Url: process.env.VNPAY_URL,
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL
};
const vnpayHelper = new vnpay_1.VNPayHelper(vnpayConfig);
router.post('/api/payments', common_1.requireAuth, [
    (0, express_validator_1.body)('orderId')
        .not()
        .isEmpty()
        .withMessage('Mã đơn hàng không được để trống'),
    (0, express_validator_1.body)('amount')
        .isFloat({ gt: 0 })
        .withMessage('Số tiền phải lớn hơn 0'),
    (0, express_validator_1.body)('bankCode')
        .optional()
        .isString()
        .withMessage('Mã ngân hàng phải là chuỗi')
], common_1.validateRequest, async (req, res) => {
    const { orderId, amount, bankCode } = req.body;
    const userId = req.currentUser.id;
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
    // Tạo mã giao dịch duy nhất
    const vnpayTxnRef = `${orderId}_${Date.now()}`;
    // Tạo payment record với trạng thái pending
    const payment = payment_1.Payment.build({
        orderId,
        stripeId: '', // Không sử dụng Stripe trong VNPay
        vnpayTxnRef,
        amount,
        currency: 'VND',
        paymentMethod: 'VNPay',
        status: payment_2.PaymentStatus.Pending
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
    }
    catch (error) {
        // Nếu có lỗi khi tạo URL VNPay, cập nhật status thành failed
        payment.set({ status: payment_2.PaymentStatus.Failed });
        await payment.save();
        throw new common_1.BadRequestError('Không thể tạo URL thanh toán VNPay');
    }
});
