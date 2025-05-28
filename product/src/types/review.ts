// src/types/review.ts

import type mongoose from 'mongoose';

// Một interface mô tả các thuộc tính
// cần thiết để tạo một Review mới
export interface ReviewAttrs {
  title: string
  rating: number
  comment: string
  userId: string
  productTitle?: string
  productId?: string
}

// Một interface mô tả các thuộc tính
// mà một Review Model có
export interface ReviewModel extends mongoose.Model<ReviewDoc> {
  build: (attrs: ReviewAttrs) => ReviewDoc
}

// Một interface mô tả các thuộc tính
// mà một Review Document có
export interface ReviewDoc extends mongoose.Document {
  title: string
  rating: number
  comment: string
  userId: string
  productTitle?: string
  productId?: string
  createdAt: string
  updatedAt: string
}
