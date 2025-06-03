// src/events/listeners/OrderUpdatedListener.ts

import { Listener, type OrderUpdatedEvent, Subjects, QueueGroupNames } from '@jimm9tran/common';
import { type Message } from 'node-nats-streaming';

import { Product } from '../../models/product';
import { ProductUpdatedPublisher } from '../publishers/ProductUpdatedPublisher';

export class OrderUpdatedListener extends Listener<OrderUpdatedEvent> {
  // Định nghĩa subject mà listener này sẽ lắng nghe (OrderUpdated)
  readonly subject = Subjects.OrderUpdated as const;
  // Đặt tên group cho listener này để load balancing giữa các instance
  queueGroupName = QueueGroupNames.ProductService;

  // Hàm xử lý khi nhận được sự kiện OrderUpdated
  async onMessage (data: OrderUpdatedEvent['data'], msg: Message): Promise<void> {
    // Kiểm tra trạng thái đơn hàng, chỉ xử lý khi đơn hàng bị hủy
    if (data.status !== 'cancelled') {
      // Nếu không phải hủy thì xác nhận đã nhận message và kết thúc
      msg.ack(); return;
    }

    // Lấy danh sách sản phẩm trong giỏ hàng từ event
    const items = data.cart;

    // Nếu không có giỏ hàng thì báo lỗi
    if (items == null) {
      throw new Error('Cart not found');
    }

    // Lặp qua từng sản phẩm trong giỏ hàng
    for (let i = 0; i < items.length; i++) {
      // Tìm sản phẩm trong database theo productId
      const product = await Product.findById(items[i].productId);

      // Nếu không tìm thấy sản phẩm thì báo lỗi
      if (product == null) {
        throw new Error('Product not found');
      }

      // Tăng lại số lượng tồn kho của sản phẩm bằng số lượng trả lại từ đơn hàng bị hủy
      const countInStock = product.countInStock + items[i].qty;

      // Nếu sản phẩm trước đó đã hết hàng và đang bị giữ chỗ (isReserved = true)
      if (product.countInStock === 0 && product.isReserved) {
        // Đánh dấu sản phẩm là còn hàng (isReserved = false) và cập nhật lại số lượng tồn kho
        product.set({
          countInStock,
          isReserved: false
        });

        // Lưu thay đổi sản phẩm vào database
        await product.save();
      } else {
        // Nếu sản phẩm vẫn còn hàng (isReserved vẫn là false), chỉ cập nhật lại số lượng tồn kho
        product.set({ countInStock });

        // Lưu thay đổi sản phẩm vào database
        await product.save();
      }

      // Phát sự kiện ProductUpdated để các service khác đồng bộ trạng thái sản phẩm
      await new ProductUpdatedPublisher(this.natsClient).publish({
        id: product.id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice,
        userId: product.userId,
        images: product.images,
        specifications: product.specifications,
        variants: product.variants,
        brand: product.brand,
        category: product.category,
        subCategory: product.subCategory,
        description: product.description,
        features: product.features,
        inTheBox: product.inTheBox,
        numReviews: product.numReviews,
        rating: product.rating,
        countInStock,
        reservedQuantity: product.reservedQuantity,
        reservations: product.reservations,
        isReserved: product.isReserved,
        reservedAt: product.reservedAt,
        reservedBy: product.reservedBy,
        tags: product.tags,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        saleEndDate: product.saleEndDate,
        version: product.version,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      });
    }

    // Xác nhận đã xử lý xong message với NATS
    msg.ack();
  }
}
