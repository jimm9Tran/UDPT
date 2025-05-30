"use strict";
// src/routes/get-payment.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const common_1 = require("@jimm9tran/common");
const payment_1 = require("../models/payment");
const router = express_1.default.Router();
exports.getPaymentRouter = router;
router.get('/api/payments/:paymentId', common_1.requireAuth, [
    (0, express_validator_1.param)('paymentId')
        .isMongoId()
        .withMessage('ID thanh toán không hợp lệ')
], common_1.validateRequest, async (req, res) => {
    const { paymentId } = req.params;
    // Tìm payment theo ID
    const payment = await payment_1.Payment.findById(paymentId);
    if (!payment) {
        throw new common_1.NotFoundError();
    }
    // TODO: Kiểm tra quyền truy cập - chỉ cho phép user sở hữu order hoặc admin
    // Hiện tại chưa có thông tin userId trong payment model
    // Có thể thêm field userId hoặc join với order service
    res.send(payment);
});
// Route lấy payment theo orderId
router.get('/api/payments/order/:orderId', common_1.requireAuth, [
    (0, express_validator_1.param)('orderId')
        .not()
        .isEmpty()
        .withMessage('Mã đơn hàng không được để trống')
], common_1.validateRequest, async (req, res) => {
    const { orderId } = req.params;
    // Tìm payment theo orderId
    const payment = await payment_1.Payment.findOne({ orderId });
    if (!payment) {
        throw new common_1.NotFoundError();
    }
    // TODO: Kiểm tra quyền truy cập tương tự như trên
    res.send(payment);
});
