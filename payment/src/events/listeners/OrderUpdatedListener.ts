// src/events/listeners/OrderUpdatedListener.ts

import { Listener, type OrderUpdatedEvent, Subjects, QueueGroupNames } from '@jimm9tran/common';
import { type Message } from 'node-nats-streaming';
import { Payment } from '../../models/payment';
import { PaymentStatus } from '../../types/payment';
import { OrderInfo } from '../../models/order-info';

export class OrderUpdatedListener extends Listener<OrderUpdatedEvent> {
  // Định nghĩa subject mà listener này sẽ lắng nghe (OrderUpdated)
  readonly subject = Subjects.OrderUpdated as const;
  // Đặt tên group cho listener này để load balancing giữa các instance
  queueGroupName = QueueGroupNames.PaymentService;

  // Hàm xử lý khi nhận được sự kiện OrderUpdated
  async onMessage (data: OrderUpdatedEvent['data'], msg: Message): Promise<void> {
    console.log(`Đã nhận sự kiện cập nhật đơn hàng: ${data.id}, trạng thái: ${data.status}`);

    try {
      // Cập nhật thông tin order trong Payment service
      const orderInfo = await OrderInfo.findById(data.id);
      if (orderInfo) {
        orderInfo.set({
          status: data.status,
          version: data.version
        });
        await orderInfo.save();
        console.log(`Đã cập nhật thông tin order ${data.id} trong Payment Service`);
      }

      // Chỉ xử lý payment khi order bị hủy
      if (data.status === 'cancelled') {
        // Tìm payment có liên quan đến order bị hủy
        const payment = await Payment.findOne({ orderId: data.id });
        
        if (payment) {
          // Chỉ cập nhật nếu payment vẫn đang pending
          if (payment.status === PaymentStatus.Pending) {
            payment.set({ status: PaymentStatus.Cancelled });
            await payment.save();
            
            console.log(`Đã cập nhật trạng thái payment ${payment.id} thành cancelled`);
          } else {
            console.log(`Payment ${payment.id} đã có trạng thái ${payment.status}, không thể hủy`);
          }
        } else {
          console.log(`Không tìm thấy payment cho đơn hàng ${data.id}`);
        }
      }

      // Xác nhận đã xử lý xong message với NATS
      msg.ack();
    } catch (error) {
      console.error('Lỗi khi xử lý OrderUpdated event:', error);
      // Không ack message để NATS có thể retry
    }
  }
}
