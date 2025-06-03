import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import type { ProductAttrs, ProductDoc, ProductModel } from '../types/product';

const productSchema = new mongoose.Schema<ProductDoc, ProductModel>(
  {
    title: {
      type: String,
      required: true
    },    price: {
      type: Number,
      required: true,
      default: 0
    },
    originalPrice: {
      type: Number,
      default: 0
    },userId: { type: String, required: true },
    images: {
      image1: { type: String, required: true },
      image2: { type: String, default: '' },
      image3: { type: String, default: '' },
      image4: { type: String, default: '' }
    },
    specifications: {
      processor: { type: String },
      ram: { type: String },
      storage: { type: String },
      display: { type: String },
      battery: { type: String },
      camera: { type: String },
      connectivity: { type: String },
      operatingSystem: { type: String },
      warranty: { type: String },
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
        'case', 'screen-protector', 'power-bank', 'cable'
      ]
    },
    subCategory: {
      type: String
    },
    description: {
      type: String,
      required: true
    },
    features: [{ type: String }],
    inTheBox: [{ type: String }],
    numReviews: {
      type: Number,
      required: true,
      default: 0
    },
    rating: {
      type: Number,
      required: true,
      default: 0
    },
    countInStock: {
      type: Number,
      required: true,
      default: 1
    },
    reservedQuantity: {
      type: Number,
      required: true,
      default: 0
    },
    reservations: [{
      reservationId: { type: String, required: true },
      quantity: { type: Number, required: true },
      userId: { type: String },
      reservedAt: { type: Date, default: Date.now },
      expiresAt: { type: Date, required: true }
    }],isReserved: {
      type: Boolean,
      required: true,
      default: false
    },    orderId: {
      type: String
    },
    reservedAt: {
      type: Date
    },
    reservedBy: {
      type: String
    },
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

productSchema.statics.findByEvent = (event: {
  id: string
  version: number
}) => {
  return Product.findOne({
    _id: event.id,
    version: event.version - 1
  });
};

productSchema.statics.build = (attrs: ProductAttrs) => {
  return new Product({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
    originalPrice: attrs.originalPrice,
    userId: attrs.userId,
    images: attrs.images,
    specifications: attrs.specifications,
    variants: attrs.variants,
    brand: attrs.brand,
    category: attrs.category,
    subCategory: attrs.subCategory,
    description: attrs.description,
    features: attrs.features,
    inTheBox: attrs.inTheBox,
    numReviews: attrs.numReviews,
    rating: attrs.rating,
    countInStock: attrs.countInStock,
    reservedQuantity: attrs.reservedQuantity,
    reservations: attrs.reservations,
    isReserved: attrs.isReserved,
    reservedAt: attrs.reservedAt,
    reservedBy: attrs.reservedBy,
    tags: attrs.tags,
    isActive: attrs.isActive,
    isFeatured: attrs.isFeatured,
    saleEndDate: attrs.saleEndDate
  });
};

const Product = mongoose.model<ProductDoc, ProductModel>(
  'Product',
  productSchema
);

export { Product };
