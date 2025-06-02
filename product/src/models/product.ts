// src/models/product.ts

import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import type { ProductAttrs, ProductDoc, ProductModel } from '../types/product';
import { reviewSchema } from './review';

const productSchema = new mongoose.Schema<ProductDoc, ProductModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    originalPrice: {
      type: Number,
      min: 0
    },
    userId: {
      type: String,
      required: true
    },
    images: {
      image1: { type: String, required: true },
      image2: { type: String, default: '' },
      image3: { type: String, default: '' },
      image4: { type: String, default: '' }
    },
    // Electronics specific attributes
    specifications: {
      // Common electronics specs
      processor: { type: String }, // For phones, laptops
      ram: { type: String }, // Memory
      storage: { type: String }, // Storage capacity
      display: { type: String }, // Screen size/type
      battery: { type: String }, // Battery capacity
      camera: { type: String }, // Camera specs
      connectivity: { type: String }, // WiFi, Bluetooth, etc.
      operatingSystem: { type: String }, // iOS, Android, Windows, etc.
      warranty: { type: String, default: '12 tháng' },
      // Physical attributes
      weight: { type: String },
      dimensions: { type: String },
      color: { type: String }
    },
    variants: [{
      color: { type: String },
      storage: { type: String },
      price: { type: Number },
      originalPrice: { type: Number },
      countInStock: { type: Number, default: 0 },
      sku: { type: String }
    }],
    brand: {
      type: String,
      required: true,
      enum: [
        'Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Huawei',
        'HP', 'Dell', 'Asus', 'Acer', 'Lenovo', 'MSI', 'MacBook',
        'Sony', 'JBL', 'Bose', 'Sennheiser', 'Audio-Technica',
        'Logitech', 'Razer', 'SteelSeries', 'Corsair',
        'Other'
      ]
    },
    category: {
      type: String,
      required: true,
      enum: [
        'smartphone', 'laptop', 'tablet', 'smartwatch', 'headphone', 
        'earphone', 'speaker', 'gaming', 'accessory', 'charger',
        'case', 'screen-protector', 'power-bank', 'cable',
        // Vietnamese categories
        'Laptop', 'Điện thoại', 'Tablet', 'Tai nghe', 'Loa', 
        'Smartwatch', 'Phụ kiện', 'PC & Linh kiện', 'Gaming', 'Apple', 'Khác'
      ]
    },
    subCategory: {
      type: String
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000
    },
    features: [{ type: String }], // Key features list
    inTheBox: [{ type: String }], // What's included in package
    reviews: [reviewSchema],
    numReviews: {
      type: Number,
      required: true,
      default: 0
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 5
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    isReserved: {
      type: Boolean,
      required: true,
      default: false
    },
    orderId: {
      type: String
    },
    // Reservation tracking fields
    reservedAt: {
      type: Date
    },
    reservedBy: {
      type: String // User ID who reserved this product
    },
    // SEO and marketing
    tags: [{ type: String }],
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    saleEndDate: {
      type: Date
    }
  },
  {
    toJSON: {
      transform (doc, ret) {
        // Chuyển _id thành id, xóa _id và __v
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      }
    },
    timestamps: true
  }
);

productSchema.set('versionKey', 'version');

// @ts-ignore
productSchema.plugin(updateIfCurrentPlugin);

productSchema.statics.build = (attrs: ProductAttrs) => {
  return new Product(attrs);
};

const Product = mongoose.model<ProductDoc, ProductModel>(
  'Product',
  productSchema
);

export { Product };
