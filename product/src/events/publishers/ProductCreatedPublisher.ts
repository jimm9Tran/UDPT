// src/events/publishers/ProductCreatedPublisher.ts

import { type ProductCreatedEvent, Publisher, Subjects } from "@jimm9tran/common";

export class ProductCreatedPublisher extends Publisher<ProductCreatedEvent> {
  readonly subject = Subjects.ProductCreated as const;
}