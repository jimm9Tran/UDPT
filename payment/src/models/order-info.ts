// src/models/order-info.ts

import mongoose from 'mongoose';

// Interface mô tả thuộc tính của một order trong payment service
interface OrderInfoAttrs {
  id: string;
  userId: string;
  status: string;
  totalPrice: number;
  paymentMethod: string;
  version: number;
}

// Interface mô tả thuộc tính của Order Document
interface OrderInfoDoc extends mongoose.Document {
  id: string;
  userId: string;
  status: string;
  totalPrice: number;
  paymentMethod: string;
  version: number;
}

// Interface mô tả thuộc tính của Order Model
interface OrderInfoModel extends mongoose.Model<OrderInfoDoc> {
  build(attrs: OrderInfoAttrs): OrderInfoDoc;
}

const orderInfoSchema = new mongoose.Schema(
  {
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
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

orderInfoSchema.set('versionKey', 'version');

orderInfoSchema.statics.build = (attrs: OrderInfoAttrs) => {
  return new OrderInfo({
    _id: attrs.id,
    userId: attrs.userId,
    status: attrs.status,
    totalPrice: attrs.totalPrice,
    paymentMethod: attrs.paymentMethod,
    version: attrs.version
  });
};

const OrderInfo = mongoose.model<OrderInfoDoc, OrderInfoModel>('OrderInfo', orderInfoSchema);

export { OrderInfo };
