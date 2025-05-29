// src/publishers/ExpirationCompletedPublisher.ts

import { Subjects, Publisher, type ExpirationCompletedEvent } from '@jimm9tran/common';

export class ExpirationCompletedPublisher extends Publisher<ExpirationCompletedEvent> {
  subject: Subjects.ExpirationCompleted = Subjects.ExpirationCompleted;
}
