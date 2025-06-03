import { Listener, type OrderCreatedEvent, Subjects, QueueGroupNames } from '@jimm9tran/common';
import { type Message } from 'node-nats-streaming';

import { Product } from '../../models/product';
import { ProductUpdatedPublisher } from '../publishers/ProductUpdatedPublisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  // Định nghĩa subject mà listener này sẽ lắng nghe (OrderCreated)
  readonly subject = Subjects.OrderCreated as const;
  queueGroupName = QueueGroupNames.ProductService;

  // Hàm xử lý khi nhận được sự kiện OrderCreated
  async onMessage (data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
    // Lấy danh sách sản phẩm trong giỏ hàng từ event
    const items = data.cart;

    // Nếu giỏ hàng rỗng thì kết thúc
    if (items!.length === 0) {
      msg.ack(); return;
    }

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

      // Giảm số lượng tồn kho của sản phẩm theo số lượng đặt hàng
      const countInStock = product.countInStock - items[i].qty;

      // Nếu sản phẩm đã hết hàng sau khi trừ
      if (countInStock === 0) {
        // Đánh dấu sản phẩm đã được giữ chỗ (isReserved = true)
        product.set({
          countInStock,
          isReserved: true
        });
      } else {
        // Nếu vẫn còn hàng thì chỉ cập nhật lại số lượng tồn kho
        product.set({ countInStock });
      }

      // Lưu thay đổi sản phẩm vào database
      await product.save();

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
        countInStock: product.countInStock,
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
