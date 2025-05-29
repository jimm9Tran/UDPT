// src/listeners/ProductUpdatedListener.ts

import { Message } from 'node-nats-streaming';
import { Subjects, Listener, type ProductUpdatedEvent, QueueGroupNames } from '@jimm9tran/common';

import { Product } from '../../models/product';

// Listener xử lý sự kiện ProductUpdated
export class ProductUpdatedListener extends Listener<ProductUpdatedEvent> {
  // Khóa sự kiện và queue group cho order-service
  subject: Subjects.ProductUpdated = Subjects.ProductUpdated;
  queueGroupName = QueueGroupNames.ORDER_SERVICE;

  // Hàm gọi khi nhận message từ NATS
  async onMessage(
    data: ProductUpdatedEvent['data'],
    msg: Message
  ): Promise<void> {
    // Tìm bản ghi product theo id và version trước (đảm bảo xử lý đúng thứ tự)
    const product = await Product.findByEvent({
      id: data.id,
      version: data.version
    });

    // Nếu không tìm thấy, không ném lỗi, chỉ ghi log và acknowledge để tránh retry vô hạn
    if (!product) {
      console.warn(
        `ProductUpdatedListener: Product id=${data.id} version=${data.version} not found, skipping.`
      );
      msg.ack();
      return;
    }

    // Cập nhật các trường cần thay đổi
    product.set({
      title: data.title,
      price: data.price,
      image: data.image,
      colors: data.colors,
      sizes: data.sizes,
      countInStock: data.countInStock,
      numReviews: data.numReviews,
      rating: data.rating,
      isReserved: data.isReserved
    });

    // Lưu vào database (version sẽ tự tăng nhờ plugin)
    await product.save();

    // Thông báo đã xử lý message thành công
    msg.ack();
  }
}
