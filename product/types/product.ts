// src/types/product.ts

import type mongoose from 'mongoose';
import type { ReviewDoc } from './review';

export interface ImageInterface {
  image1: string
  image2?: string
  image3?: string
  image4?: string
}

// Một interface mô tả các thuộc tính
// cần thiết để tạo một Product mới
export interface ProductAttrs {
  title: string
  price: number
  userId: string
  images: ImageInterface
  colors?: string
  sizes?: string
  brand: string
  category: string
  material: string
  description: string
  reviews?: ReviewDoc[]
  numReviews: number
  rating: number
  countInStock: number
  isReserved: boolean
}

// Một interface mô tả các thuộc tính
// mà một Product Model có
export interface ProductModel extends mongoose.Model<ProductDoc> {
  build: (attrs: ProductAttrs) => ProductDoc
}

// Một interface mô tả các thuộc tính
// mà một Product Document có
export interface ProductDoc extends mongoose.Document {
  title: string
  price: number
  userId: string
  images: ImageInterface
  colors?: string
  sizes?: string
  brand?: string
  category: string
  material?: string
  description: string
  reviews?: ReviewDoc[]
  numReviews: number
  rating: number
  countInStock: number
  isReserved: boolean
  orderId?: string
  version: number
  createdAt: string
  updatedAt: string
}
