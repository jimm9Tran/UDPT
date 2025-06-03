import { Publisher, type OrderCreatedEvent, Subjects } from '@jimm9tran/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated as const;
}
