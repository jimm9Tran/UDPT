// src/events/publishers/ProductUpdatedPublisher.ts

import { type ProductUpdatedEvent, Publisher, Subjects } from '@jimm9tran/common';

export class ProductUpdatedPublisher extends Publisher<ProductUpdatedEvent> {
  subject: Subjects.ProductUpdated = Subjects.ProductUpdated;
}
