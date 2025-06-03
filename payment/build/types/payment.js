"use strict";
// src/types/payment.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethod = exports.PaymentStatus = void 0;
// Enum cho trạng thái thanh toán
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["Pending"] = "pending";
    PaymentStatus["Success"] = "success";
    PaymentStatus["Failed"] = "failed";
    PaymentStatus["Cancelled"] = "cancelled";
    PaymentStatus["AwaitingDelivery"] = "awaiting_delivery"; // For COD payments
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
// Enum cho phương thức thanh toán
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["VNPay"] = "VNPay";
    PaymentMethod["COD"] = "COD";
    PaymentMethod["Stripe"] = "Stripe";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
