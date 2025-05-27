import { Publisher, type OrderUpdatedEvent, Subjects } from '@jimm9tran/common';

export class OrderUpdatedPublisher extends Publisher<OrderUpdatedEvent> {
  subject: Subjects.OrderUpdated = Subjects.OrderUpdated;
}
