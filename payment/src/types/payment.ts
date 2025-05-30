// src/types/payment.ts

import type mongoose from 'mongoose';

// Một interface mô tả các thuộc tính cần thiết để tạo một Payment mới
export interface PaymentAttrs {
  orderId: string;
  stripeId?: string; // Optional for COD
  vnpayTxnRef?: string; // Optional for COD
  vnpayTransactionNo?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  vnpayResponseCode?: string;
  vnpayBankCode?: string;
  vnpayCardType?: string;
  paidAt?: Date;
  deliveryAddress?: string; // For COD payments
  phoneNumber?: string; // For COD payments
}

// Một interface mô tả các thuộc tính mà một Payment Model có
export interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build: (attrs: PaymentAttrs) => PaymentDoc;
}

// Một interface mô tả các thuộc tính mà một Payment Document có
export interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId?: string; // Optional for COD
  vnpayTxnRef?: string; // Optional for COD
  vnpayTransactionNo?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  vnpayResponseCode?: string;
  vnpayBankCode?: string;
  vnpayCardType?: string;
  paidAt?: Date;
  deliveryAddress?: string; // For COD payments
  phoneNumber?: string; // For COD payments
  version: number;
  createdAt: string;
  updatedAt: string;
}

// Enum cho trạng thái thanh toán
export enum PaymentStatus {
  Pending = 'pending',
  Success = 'success',
  Failed = 'failed',
  Cancelled = 'cancelled',
  AwaitingDelivery = 'awaiting_delivery' // For COD payments
}

// Enum cho phương thức thanh toán
export enum PaymentMethod {
  VNPay = 'VNPay',
  COD = 'COD', // Cash on Delivery
  Stripe = 'Stripe'
}

// Interface cho VNPay request
export interface VNPayRequest {
  orderId: string;
  amount: number;
  orderInfo: string;
  returnUrl: string;
  ipAddr: string;
}

// Interface cho VNPay response
export interface VNPayResponse {
  vnp_TxnRef: string;
  vnp_Amount: string;
  vnp_OrderInfo: string;
  vnp_ResponseCode: string;
  vnp_TransactionNo: string;
  vnp_BankCode: string;
  vnp_PayDate: string;
  vnp_SecureHash: string;
  vnp_CardType?: string;
}
