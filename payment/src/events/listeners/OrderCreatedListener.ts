// src/events/listeners/OrderCreatedListener.ts

import { Listener, type OrderCreatedEvent, Subjects, QueueGroupNames } from '@jimm9tran/common';
import { type Message } from 'node-nats-streaming';
import { OrderInfo } from '../../models/order-info';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  // Định nghĩa subject mà listener này sẽ lắng nghe (OrderCreated)
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  // Đặt tên group cho listener này để load balancing giữa các instance
  queueGroupName = QueueGroupNames.PAYMENT_SERVICE;

  // Hàm xử lý khi nhận được sự kiện OrderCreated
  async onMessage (data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
    // Log thông tin đơn hàng mới được tạo để theo dõi
    console.log(`Đã nhận sự kiện tạo đơn hàng: ${data.id}`);
    console.log(`Tổng tiền đơn hàng: ${data.totalPrice} VND`);
    console.log(`Phương thức thanh toán: ${data.paymentMethod}`);
    
    // Lưu thông tin order vào database để sử dụng khi tạo payment
    const orderInfo = OrderInfo.build({
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
