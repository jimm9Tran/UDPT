import { type Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  type ProductCreatedEvent,
  QueueGroupNames
} from '@jimm9tran/common';

import { Product } from '../../models/product';

export class ProductCreatedListener extends Listener<ProductCreatedEvent> {
  readonly subject = Subjects.ProductCreated as const;
  queueGroupName = QueueGroupNames.OrderService;
  async onMessage (data: ProductCreatedEvent['data'], msg: Message): Promise<void> {
    const {
      id,
      title,
      price,
      userId,
      images,
      description,
      brand,
      category,
      specifications,
      variants,
      countInStock,
      numReviews,
      rating,
      reservations
    } = data;    const product = Product.build({
      id,
      title,
      price,
      userId,
      images,
      description,
      brand,
      category,
      specifications,
      variants,
      countInStock,
      numReviews,
      rating,
      reservations,
      reservedQuantity: data.reservedQuantity || 0,
      isReserved: false,
      isActive: data.isActive !== false,
      isFeatured: data.isFeatured || false
    });
    await product.save();

    // Acknowledge the message and tell NATS server it successfully processed
    msg.ack();
  }
}
