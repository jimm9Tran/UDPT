// src/types/product.ts

import type mongoose from 'mongoose';
import type { ReviewDoc } from './review';

export interface ImageInterface {
  image1: string
  image2?: string
  image3?: string
  image4?: string
}

export interface SpecificationInterface {
  processor?: string
  ram?: string
  storage?: string
  display?: string
  battery?: string
  camera?: string
  connectivity?: string
  operatingSystem?: string
  warranty?: string
  weight?: string
  dimensions?: string
  color?: string
}

export interface VariantInterface {
  color?: string
  storage?: string
  price?: number
  originalPrice?: number
  countInStock?: number
  sku?: string
}

export interface ReservationInterface {
  reservationId: string
  quantity: number
  userId?: string
  reservedAt: Date
  expiresAt: Date
}

// Electronics categories
export type ElectronicsCategory = 
  | 'smartphone' 
  | 'laptop' 
  | 'tablet' 
  | 'smartwatch' 
  | 'headphone' 
  | 'earphone' 
  | 'speaker' 
  | 'gaming' 
  | 'accessory' 
  | 'charger'
  | 'case' 
  | 'screen-protector' 
  | 'power-bank' 
  | 'cable';

export type ElectronicsBrand = 
  | 'Apple' 
  | 'Samsung' 
  | 'Xiaomi' 
  | 'Oppo' 
  | 'Vivo' 
  | 'Realme' 
  | 'Huawei'
  | 'HP' 
  | 'Dell' 
  | 'Asus' 
  | 'Acer' 
  | 'Lenovo' 
  | 'MSI' 
  | 'MacBook'
  | 'Sony' 
  | 'JBL' 
  | 'Bose' 
  | 'Sennheiser' 
  | 'Audio-Technica'
  | 'Logitech' 
  | 'Razer' 
  | 'SteelSeries' 
  | 'Corsair'
  | 'Other';

// Một interface mô tả các thuộc tính
// cần thiết để tạo một Product mới
export interface ProductAttrs {
  title: string
  price: number
  originalPrice?: number
  userId: string
  images: ImageInterface
  specifications?: SpecificationInterface
  variants?: VariantInterface[]
  brand: ElectronicsBrand
  category: ElectronicsCategory
  subCategory?: string
  description: string
  features?: string[]
  inTheBox?: string[]
  reviews?: ReviewDoc[]
  numReviews: number
  rating: number
  countInStock: number
  reservedQuantity?: number
  reservations?: ReservationInterface[]
  isReserved?: boolean // Keep for backward compatibility
  reservedAt?: Date
  reservedBy?: string
  tags?: string[]
  isActive?: boolean
  isFeatured?: boolean
  saleEndDate?: Date
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
  originalPrice?: number
  userId: string
  images: ImageInterface
  specifications?: SpecificationInterface
  variants?: VariantInterface[]
  brand: ElectronicsBrand
  category: ElectronicsCategory
  subCategory?: string
  description: string
  features?: string[]
  inTheBox?: string[]
  reviews?: ReviewDoc[]
  numReviews: number
  rating: number
  countInStock: number
  reservedQuantity: number
  reservations: ReservationInterface[]
  isReserved: boolean // Keep for backward compatibility
  orderId?: string
  reservedAt?: Date
  reservedBy?: string
  tags?: string[]
  isActive: boolean
  isFeatured: boolean
  saleEndDate?: Date
  version: number
  createdAt: string
  updatedAt: string
}
