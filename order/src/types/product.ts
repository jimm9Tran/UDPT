import type mongoose from 'mongoose';

// Một interface mô tả các thuộc tính cần thiết để tạo một Sản phẩm mới
export interface ProductAttrs {
  id: string
  title: string
  price: number
  userId: string
  image: string
  colors?: string
  sizes?: string
  countInStock: number
  numReviews: number
  rating: number
  isReserved: boolean
}

// Một interface mô tả các thuộc tính mà một Model Sản phẩm có
export interface ProductModel extends mongoose.Model<ProductDoc> {
  build: (attrs: ProductAttrs) => ProductDoc
  findByEvent: (event: {
    id: string
    version: number
  }) => Promise<ProductDoc | null>
}

// Một interface mô tả các thuộc tính mà một Tài liệu Sản phẩm có
export interface ProductDoc extends mongoose.Document {
  title: string
  price: number
  userId: string
  image: string
  colors?: string
  sizes?: string
  countInStock: number
  numReviews: number
  rating: number
  isReserved: boolean
  version: number
  createdAt: string
  updatedAt: string
}
