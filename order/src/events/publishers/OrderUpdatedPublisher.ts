import { Publisher, type OrderUpdatedEvent, Subjects } from '@jimm9tran/common';

export class OrderUpdatedPublisher extends Publisher<OrderUpdatedEvent> {
  readonly subject = Subjects.OrderUpdated as const;
}
