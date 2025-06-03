"use strict";
// src/events/listeners/OrderUpdatedListener.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderCancelledListener = void 0;
const common_1 = require("@jimm9tran/common");
const payment_1 = require("../../models/payment");
const payment_2 = require("../../types/payment");
class OrderCancelledListener extends common_1.Listener {
    constructor() {
        super(...arguments);
        // Định nghĩa subject mà listener này sẽ lắng nghe (OrderUpdated)
        this.subject = common_1.Subjects.OrderUpdated;
        // Đặt tên group cho listener này để load balancing giữa các instance
        this.queueGroupName = common_1.QueueGroupNames.PaymentService;
    }
    // Hàm xử lý khi nhận được sự kiện OrderUpdated
    async onMessage(data, msg) {
        // Chỉ xử lý khi order bị hủy
        if (data.status !== 'cancelled') {
            msg.ack();
            return;
        }
        console.log(`Đã nhận sự kiện hủy đơn hàng: ${data.id}`);
        try {
            // Tìm payment có liên quan đến order bị hủy
            const payment = await payment_1.Payment.findOne({ orderId: data.id });
            if (payment) {
                // Chỉ cập nhật nếu payment vẫn đang pending
                if (payment.status === payment_2.PaymentStatus.Pending) {
                    payment.set({ status: payment_2.PaymentStatus.Cancelled });
                    await payment.save();
                    console.log(`Đã cập nhật trạng thái payment ${payment.id} thành cancelled`);
                }
                else {
                    console.log(`Payment ${payment.id} đã có trạng thái ${payment.status}, không thể hủy`);
                }
            }
            else {
                console.log(`Không tìm thấy payment cho đơn hàng ${data.id}`);
            }
            // Xác nhận đã xử lý xong message với NATS
            msg.ack();
        }
        catch (error) {
            console.error('Lỗi khi xử lý OrderUpdated event:', error);
            // Không ack message để NATS có thể retry
        }
    }
}
exports.OrderCancelledListener = OrderCancelledListener;
