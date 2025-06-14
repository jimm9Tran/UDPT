// src/events/publishers/ProductDeletedPublisher.ts

import { type ProductDeletedEvent, Publisher, Subjects } from '@jimm9tran/common';

export class ProductDeletedPublisher extends Publisher<ProductDeletedEvent> {
  readonly subject = Subjects.ProductDeleted as const;
}
