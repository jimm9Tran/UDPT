"use strict";
// src/types/payment.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = void 0;
// Enum cho trạng thái thanh toán
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["Pending"] = "pending";
    PaymentStatus["Success"] = "success";
    PaymentStatus["Failed"] = "failed";
    PaymentStatus["Cancelled"] = "cancelled";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
