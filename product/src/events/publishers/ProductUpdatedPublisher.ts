// src/events/publishers/ProductUpdatedPublisher.ts

import { type ProductUpdatedEvent, Publisher, Subjects } from '@jimm9tran/common';

export class ProductUpdatedPublisher extends Publisher<ProductUpdatedEvent> {
  readonly subject = Subjects.ProductUpdated as const;
}
