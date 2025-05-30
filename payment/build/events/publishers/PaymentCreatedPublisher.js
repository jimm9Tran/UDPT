"use strict";
// src/events/publishers/PaymentCreatedPublisher.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentCreatedPublisher = void 0;
const common_1 = require("@jimm9tran/common");
class PaymentCreatedPublisher extends common_1.Publisher {
    constructor() {
        super(...arguments);
        this.subject = common_1.Subjects.PaymentCreated;
    }
}
exports.PaymentCreatedPublisher = PaymentCreatedPublisher;
