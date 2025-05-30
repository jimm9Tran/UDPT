"use strict";
// src/models/order-info.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderInfo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const orderInfoSchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    version: {
        type: Number,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});
orderInfoSchema.set('versionKey', 'version');
orderInfoSchema.statics.build = (attrs) => {
    return new OrderInfo({
        _id: attrs.id,
        userId: attrs.userId,
        status: attrs.status,
        totalPrice: attrs.totalPrice,
        paymentMethod: attrs.paymentMethod,
        version: attrs.version
    });
};
const OrderInfo = mongoose_1.default.model('OrderInfo', orderInfoSchema);
exports.OrderInfo = OrderInfo;
