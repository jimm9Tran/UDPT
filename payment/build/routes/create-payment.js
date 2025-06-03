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
const NatsWrapper_1 = require("../NatsWrapper");
const PaymentCreatedPublisher_1 = require("../events/publishers/PaymentCreatedPublisher");
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
    (0, express_validator_1.body)('paymentMethod')
        .isIn(['VNPay', 'COD'])
        .withMessage('Phương thức thanh toán phải là VNPay hoặc COD'),
    (0, express_validator_1.body)('bankCode')
        .optional()
        .isString()
        .withMessage('Mã ngân hàng phải là chuỗi')
], common_1.validateRequest, async (req, res) => {
    const { orderId, amount, bankCode, paymentMethod = 'VNPay' } = req.body;
    const userId = req.currentUser.id;
    console.log('Payment request - User ID:', userId);
    console.log('Payment request - Order ID:', orderId);
    console.log('Payment request - Amount:', amount);
    console.log('Payment request - Method:', paymentMethod);
    // Kiểm tra order có tồn tại và thuộc về user hiện tại không
    const orderInfo = await order_info_1.OrderInfo.findOne({ _id: orderId });
    console.log('Found order info:', orderInfo ? 'Yes' : 'No');
    if (orderInfo) {
        console.log('Order userId:', orderInfo.userId);
        console.log('Request userId:', userId);
    }
    if (!orderInfo) {
        throw new common_1.NotFoundError();
    }
    if (orderInfo.userId !== userId) {
        console.log('Authorization failed - User IDs do not match');
        throw new common_1.NotAuthorizedError();
    }
    console.log('User authorization passed');
    if (orderInfo.status === 'cancelled') {
        console.log('Order is cancelled');
        throw new common_1.BadRequestError('Đơn hàng đã bị hủy, không thể thanh toán');
    }
    if (orderInfo.status === 'completed') {
        console.log('Order is already completed');
        throw new common_1.BadRequestError('Đơn hàng đã được thanh toán');
    }
    console.log('Order status check passed, status:', orderInfo.status);
    // Kiểm tra số tiền có khớp với đơn hàng không
    console.log('Amount check - Request:', amount, 'Order:', orderInfo.totalPrice);
    if (amount !== orderInfo.totalPrice) {
        console.log('Amount mismatch error');
        throw new common_1.BadRequestError(`Số tiền thanh toán (${amount}) không khớp với tổng tiền đơn hàng (${orderInfo.totalPrice})`);
    }
    console.log('Amount validation passed');
    // Kiểm tra xem đã có payment cho order này chưa
    console.log('Checking for existing payment...');
    const existingPayment = await payment_1.Payment.findOne({ orderId });
    if (existingPayment) {
        console.log('Existing payment found, throwing error');
        throw new common_1.BadRequestError('Đơn hàng này đã có giao dịch thanh toán');
    }
    console.log('No existing payment found');
    // Tạo mã giao dịch duy nhất
    const vnpayTxnRef = `${orderId}_${Date.now()}`;
    console.log('Generated transaction reference:', vnpayTxnRef);
    // Xử lý thanh toán COD
    if (paymentMethod === 'COD') {
        console.log('Processing COD payment...');
        // Tạo COD payment record với trạng thái completed ngay lập tức
        const payment = payment_1.Payment.build({
            orderId,
            stripeId: `cod_${vnpayTxnRef}`,
            vnpayTxnRef,
            amount,
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
            stripeId: payment.stripeId
        });
        console.log(`✅ COD Payment completed for order ${orderId}, payment ID: ${payment.id}`);
        // COD payment không cần redirect, chỉ cần thông báo thành công
        res.status(201).send({
            id: payment.id,
            orderId: payment.orderId,
            amount: payment.amount,
            status: payment.status,
            paymentMethod: 'COD',
            vnpayTxnRef: payment.vnpayTxnRef,
            paidAt: payment.paidAt,
            message: "Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng (COD).",
            instructions: "Vui lòng chuẩn bị tiền mặt để thanh toán khi shipper giao hàng."
        });
        return;
    }
    // Tạo payment record với trạng thái pending
    console.log('Creating payment record...');
    const payment = payment_1.Payment.build({
        orderId,
        stripeId: '', // Không sử dụng Stripe trong VNPay
        vnpayTxnRef,
        amount,
        currency: 'VND',
        paymentMethod: payment_2.PaymentMethod.VNPay,
        status: payment_2.PaymentStatus.Pending
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
                const updatedPayment = await payment_1.Payment.findById(payment.id);
                if (updatedPayment && updatedPayment.status === payment_2.PaymentStatus.Pending) {
                    updatedPayment.set({
                        status: payment_2.PaymentStatus.Success,
                        stripeId: `demo_${payment.vnpayTxnRef}`,
                        paidAt: new Date()
                    });
                    await updatedPayment.save();
                    // Publish payment completed event
                    await new PaymentCreatedPublisher_1.PaymentCreatedPublisher(NatsWrapper_1.natsWrapper.client).publish({
                        id: updatedPayment.id,
                        orderId: updatedPayment.orderId,
                        stripeId: updatedPayment.stripeId
                    });
                    console.log(`✅ Demo payment ${payment.id} completed successfully!`);
                }
            }
            catch (autoCompleteError) {
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
    }
    catch (error) {
        console.log('Error in mock payment creation:', error);
        // If error in mock payment, update status to failed
        payment.set({ status: payment_2.PaymentStatus.Failed });
        await payment.save();
        throw new common_1.BadRequestError('Không thể tạo mock payment cho demo');
    }
});
