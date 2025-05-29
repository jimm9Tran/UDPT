// src/types/ỏder.ts

import type mongoose from 'mongoose';
import { type OrderStatus } from '@jimm9tran/common';

export interface CartAttrs {
  userId: string
  title: string
  qty: number
  color: string
  size: string
  image: string
  price: number
  countInStock: number
  discount: number
  productId: string
}

export interface ShippingAddressAttrs {
  address: string
  city: string
  postalCode: string
  country: string
}

// Interface mô tả các thuộc tính được yêu cầu để tạo một Đơn hàng mới
export interface OrderAttrs {
  userId: string
  status: OrderStatus
  expiresAt: Date
  cart?: CartAttrs[]
  shippingAddress?: ShippingAddressAttrs
  paymentMethod: string
  itemsPrice: number
  shippingPrice: number
  taxPrice: number
  totalPrice: number
  isPaid?: boolean
  paidAt?: Date
  isDelivered?: boolean
  deliveredAt?: Date
}

// Interface mô tả các thuộc tính mà một Order Model có
export interface OrderModel extends mongoose.Model<OrderDoc> {
  build: (attrs: OrderAttrs) => OrderDoc
}

// Interface mô tả các thuộc tính mà một Order Document có
export interface OrderDoc extends mongoose.Document {
  userId: string
  status: OrderStatus
  expiresAt: Date
  cart?: CartAttrs[]
  shippingAddress?: ShippingAddressAttrs
  paymentMethod: string
  itemsPrice: number
  shippingPrice: number
  taxPrice: number
  totalPrice: number
  isPaid?: boolean
  paidAt?: Date
  isDelivered?: boolean
  deliveredAt?: Date
  version: number
  createdAt: string
  updatedAt: string
}
