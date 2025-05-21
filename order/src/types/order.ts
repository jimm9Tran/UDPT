import type mongoose from 'mongoose';
import { type OrderStatus } from '../enums/order-status.enum';

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

// Một interface mô tả các thuộc tính cần thiết để tạo một Đơn hàng mới
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

// Một interface mô tả các thuộc tính mà một Model Đơn hàng có
export interface OrderModel extends mongoose.Model<OrderDoc> {
  build: (attrs: OrderAttrs) => OrderDoc
}

// Một interface mô tả các thuộc tính mà một Docs Đơn hàng có
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
