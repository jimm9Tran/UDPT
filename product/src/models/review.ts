// src/models/review.ts

import mongoose from 'mongoose';
import type { ReviewAttrs, ReviewDoc, ReviewModel } from '../routes/types/review';

export const reviewSchema = new mongoose.Schema<ReviewDoc, ReviewModel>(
  {
    title: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true
    },
    comment: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    productTitle: {
      type: String,
      required: false
    },
    productId: {
      type: String,
      required: false
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

reviewSchema.statics.build = (attrs: ReviewAttrs) => {
  return new Review(attrs);
};

const Review = mongoose.model<ReviewDoc, ReviewModel>('Review', reviewSchema);

export { Review };
