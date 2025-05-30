"use strict";
// src/events/listeners/OrderCreatedListener.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderCreatedListener = void 0;
const common_1 = require("@jimm9tran/common");
const order_info_1 = require("../../models/order-info");
class OrderCreatedListener extends common_1.Listener {
    constructor() {
        super(...arguments);
        // Định nghĩa subject mà listener này sẽ lắng nghe (OrderCreated)
        this.subject = common_1.Subjects.OrderCreated;
        // Đặt tên group cho listener này để load balancing giữa các instance
        this.queueGroupName = common_1.QueueGroupNames.PAYMENT_SERVICE;
    }
    // Hàm xử lý khi nhận được sự kiện OrderCreated
    async onMessage(data, msg) {
        // Log thông tin đơn hàng mới được tạo để theo dõi
        console.log(`Đã nhận sự kiện tạo đơn hàng: ${data.id}`);
        console.log(`Tổng tiền đơn hàng: ${data.totalPrice} VND`);
        console.log(`Phương thức thanh toán: ${data.paymentMethod}`);
        // Lưu thông tin order vào database để sử dụng khi tạo payment
        const orderInfo = order_info_1.OrderInfo.build({
            id: data.id,
            userId: data.userId,
            status: data.status,
            totalPrice: data.totalPrice,
            paymentMethod: data.paymentMethod,
            version: data.version
        });
        await orderInfo.save();
        console.log(`Đã lưu thông tin order ${data.id} vào Payment Service`);
        // Xác nhận đã xử lý xong message với NATS
        msg.ack();
    }
}
exports.OrderCreatedListener = OrderCreatedListener;
