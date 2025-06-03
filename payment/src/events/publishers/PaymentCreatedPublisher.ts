// src/events/publishers/PaymentCreatedPublisher.ts

import { Publisher, type PaymentCreatedEvent, Subjects } from '@jimm9tran/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated as const;
}
