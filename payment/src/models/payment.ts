// src/models/payment.ts

import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import type { PaymentAttrs, PaymentDoc, PaymentModel } from '../types/payment';
import { PaymentStatus, PaymentMethod } from '../types/payment';

const paymentSchema = new mongoose.Schema<PaymentDoc, PaymentModel>(
  {
    orderId: {
      type: String,
      required: true
    },
    stripeId: {
      type: String,
      required: false // Not required for COD
    },
    vnpayTxnRef: {
      type: String,
      required: false, // Not required for COD
      sparse: true // Allow multiple null values
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
      enum: Object.values(PaymentMethod),
      default: PaymentMethod.VNPay
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.Pending
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
    },
    deliveryAddress: {
      type: String,
      required: false // For COD payments
    },
    phoneNumber: {
      type: String,
      required: false // For COD payments
    }
  },
  {
    toJSON: {
      transform (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      }
    },
    timestamps: true
  }
);

// Thiết lập version key cho optimistic concurrency control
paymentSchema.set('versionKey', 'version');
// @ts-ignore
paymentSchema.plugin(updateIfCurrentPlugin);

// Static method để tạo payment mới
paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment };
