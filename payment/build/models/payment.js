"use strict";
// src/models/payment.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_update_if_current_1 = require("mongoose-update-if-current");
const payment_1 = require("../types/payment");
const paymentSchema = new mongoose_1.default.Schema({
    orderId: {
        type: String,
        required: true
    },
    stripeId: {
        type: String,
        required: true
    },
    vnpayTxnRef: {
        type: String,
        required: true,
        unique: true
    },
    vnpayTransactionNo: {
        type: String,
        required: false
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true,
        default: 'VND'
    },
    paymentMethod: {
        type: String,
        required: true,
        default: 'VNPay'
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(payment_1.PaymentStatus),
        default: payment_1.PaymentStatus.Pending
    },
    vnpayResponseCode: {
        type: String,
        required: false
    },
    vnpayBankCode: {
        type: String,
        required: false
    },
    vnpayCardType: {
        type: String,
        required: false
    },
    paidAt: {
        type: Date,
        required: false
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    },
    timestamps: true
});
// Thiết lập version key cho optimistic concurrency control
paymentSchema.set('versionKey', 'version');
// @ts-ignore
paymentSchema.plugin(mongoose_update_if_current_1.updateIfCurrentPlugin);
// Static method để tạo payment mới
paymentSchema.statics.build = (attrs) => {
    return new Payment(attrs);
};
const Payment = mongoose_1.default.model('Payment', paymentSchema);
exports.Payment = Payment;
