import { Publisher, type OrderCreatedEvent, Subjects } from '@jimm9tran/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
