"use strict";
// src/routes/vnpay-callback.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vnpayCallbackRouter = void 0;
const express_1 = __importDefault(require("express"));
const payment_1 = require("../models/payment");
const payment_2 = require("../types/payment");
const vnpay_1 = require("../helpers/vnpay");
const NatsWrapper_1 = require("../NatsWrapper");
const PaymentCreatedPublisher_1 = require("../events/publishers/PaymentCreatedPublisher");
const router = express_1.default.Router();
exports.vnpayCallbackRouter = router;
// Khởi tạo VNPay helper với config từ env
const vnpayConfig = {
    vnp_TmnCode: process.env.VNPAY_TMN_CODE,
    vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
    vnp_Url: process.env.VNPAY_URL,
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL
};
const vnpayHelper = new vnpay_1.VNPayHelper(vnpayConfig);
// Route xử lý callback từ VNPay (GET)
router.get('/api/payments/vnpay-callback', async (req, res) => {
    const vnpayData = req.query;
    try {
        // Xác thực chữ ký từ VNPay
        const isValid = vnpayHelper.verifyCallback(vnpayData);
        if (!isValid) {
            console.error('Chữ ký VNPay không hợp lệ:', vnpayData);
            return res.status(400).send('Chữ ký không hợp lệ');
        }
        // Tìm payment record theo vnpayTxnRef
        const payment = await payment_1.Payment.findOne({ vnpayTxnRef: vnpayData.vnp_TxnRef });
        if (!payment) {
            console.error('Không tìm thấy payment với vnpayTxnRef:', vnpayData.vnp_TxnRef);
            return res.status(404).send('Không tìm thấy giao dịch');
        }
        // Kiểm tra xem payment đã được xử lý chưa
        if (payment.status !== payment_2.PaymentStatus.Pending) {
            console.log('Payment đã được xử lý trước đó:', payment.id);
            return res.redirect(`${process.env.CLIENT_URL}/orders/${payment.orderId}?status=${payment.status}`);
        }
        // Cập nhật thông tin payment từ VNPay response
        const isSuccess = vnpayHelper.isPaymentSuccess(vnpayData.vnp_ResponseCode);
        const newStatus = isSuccess ? payment_2.PaymentStatus.Success : payment_2.PaymentStatus.Failed;
        payment.set({
            status: newStatus,
            vnpayResponseCode: vnpayData.vnp_ResponseCode,
            vnpayTransactionNo: vnpayData.vnp_TransactionNo,
            vnpayBankCode: vnpayData.vnp_BankCode,
            vnpayCardType: vnpayData.vnp_CardType,
            paidAt: isSuccess ? new Date() : undefined
        });
        await payment.save();
        // Nếu thanh toán thành công, phát sự kiện PaymentCreated
        if (isSuccess) {
            await new PaymentCreatedPublisher_1.PaymentCreatedPublisher(NatsWrapper_1.natsWrapper.client).publish({
                id: payment.id,
                orderId: payment.orderId,
                stripeId: payment.stripeId
            });
            console.log(`Thanh toán thành công cho đơn hàng ${payment.orderId}, payment ID: ${payment.id}`);
        }
        else {
            console.log(`Thanh toán thất bại cho đơn hàng ${payment.orderId}, mã lỗi: ${vnpayData.vnp_ResponseCode}`);
        }
        // Redirect về frontend với thông tin kết quả
        const redirectUrl = `${process.env.CLIENT_URL}/orders/${payment.orderId}?status=${payment.status}&amount=${payment.amount}`;
        res.redirect(redirectUrl);
    }
    catch (error) {
        console.error('Lỗi khi xử lý VNPay callback:', error);
        res.status(500).send('Lỗi server khi xử lý thanh toán');
    }
});
// Route xử lý IPN (Instant Payment Notification) từ VNPay (POST)
router.post('/api/payments/vnpay-ipn', async (req, res) => {
    const vnpayData = req.body;
    try {
        // Xác thực chữ ký từ VNPay
        const isValid = vnpayHelper.verifyCallback(vnpayData);
        if (!isValid) {
            console.error('Chữ ký VNPay IPN không hợp lệ:', vnpayData);
            return res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
        }
        // Tìm payment record theo vnpayTxnRef
        const payment = await payment_1.Payment.findOne({ vnpayTxnRef: vnpayData.vnp_TxnRef });
        if (!payment) {
            console.error('Không tìm thấy payment với vnpayTxnRef trong IPN:', vnpayData.vnp_TxnRef);
            return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }
        // Kiểm tra số tiền có khớp không
        const vnpayAmount = parseInt(vnpayData.vnp_Amount) / 100; // VNPay gửi về đã nhân 100
        if (vnpayAmount !== payment.amount) {
            console.error('Số tiền không khớp - Payment amount:', payment.amount, 'VNPay amount:', vnpayAmount);
            return res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });
        }
        // Nếu payment đã được xử lý, trả về thành công
        if (payment.status !== payment_2.PaymentStatus.Pending) {
            return res.status(200).json({ RspCode: '00', Message: 'Success' });
        }
        // Cập nhật thông tin payment từ VNPay IPN
        const isSuccess = vnpayHelper.isPaymentSuccess(vnpayData.vnp_ResponseCode);
        const newStatus = isSuccess ? payment_2.PaymentStatus.Success : payment_2.PaymentStatus.Failed;
        payment.set({
            status: newStatus,
            vnpayResponseCode: vnpayData.vnp_ResponseCode,
            vnpayTransactionNo: vnpayData.vnp_TransactionNo,
            vnpayBankCode: vnpayData.vnp_BankCode,
            vnpayCardType: vnpayData.vnp_CardType,
            paidAt: isSuccess ? new Date() : undefined
        });
        await payment.save();
        // Nếu thanh toán thành công, phát sự kiện PaymentCreated
        if (isSuccess) {
            await new PaymentCreatedPublisher_1.PaymentCreatedPublisher(NatsWrapper_1.natsWrapper.client).publish({
                id: payment.id,
                orderId: payment.orderId,
                stripeId: payment.stripeId
            });
            console.log(`IPN: Thanh toán thành công cho đơn hàng ${payment.orderId}, payment ID: ${payment.id}`);
        }
        else {
            console.log(`IPN: Thanh toán thất bại cho đơn hàng ${payment.orderId}, mã lỗi: ${vnpayData.vnp_ResponseCode}`);
        }
        // Trả về success cho VNPay
        res.status(200).json({ RspCode: '00', Message: 'Success' });
    }
    catch (error) {
        console.error('Lỗi khi xử lý VNPay IPN:', error);
        res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
});
