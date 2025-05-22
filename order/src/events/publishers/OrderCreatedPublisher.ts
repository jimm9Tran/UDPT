// src/publishers/OrderCreatedPublisher.ts
import { Publisher } from '../Publisher';
import type { OrderCreatedEvent } from '../types/OrderCreatedEvent';
import { Subjects } from '../Subjects';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
