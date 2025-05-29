// src/events/delete-review.ts

import express, { type Request, type Response } from 'express';
import { param } from 'express-validator';
import {
  NotFoundError,
  requireAuth,
  validateRequest
} from '@jimm9tran/common';

import { Product } from '../models/product';
import { Review } from '../models/review';
import { ProductUpdatedPublisher } from '../events/publishers/ProductUpdatedPublisher';
import { natsWrapper } from '../NatWapper';

const router = express.Router();

router.delete(
  '/api/products/:productId/reviews',
  requireAuth, 
  [param('productId').isMongoId().withMessage('Id sản phẩm không hợp lệ')],
  validateRequest,
  async (req: Request, res: Response) => {
    // Kiểm tra sản phẩm tồn tại trong database
    const product = await Product.findById(req.params.productId);

    if (product == null) {
      throw new NotFoundError();
    }

    if (product.reviews != null) {
      // Tìm đánh giá của người dùng hiện tại trong danh sách đánh giá của sản phẩm
      const deletedId = product.reviews.find(
        (review) => review.userId.toString() === req.currentUser!.id
      );

      // Nếu không tìm thấy đánh giá của người dùng
      if (deletedId == null) {
        throw new NotFoundError();
      }

      // Tìm và xóa đánh giá trong collection Review
      const deletedReview = await Review.findById(deletedId.id);

      if (deletedReview == null) {
        throw new NotFoundError();
      }

      // Xóa đánh giá khỏi database
      await Review.findByIdAndDelete(deletedId.id);

      // Lọc ra danh sách đánh giá mới, loại bỏ đánh giá vừa xóa
      const updateReviews = product.reviews.filter(
        (review) => review.userId.toString() !== req.currentUser!.id
      );

      // Tính toán lại số lượng đánh giá và rating trung bình
      const numReviews = updateReviews.length;
      let productRating = 0;

      if (numReviews > 0) {
        // Nếu còn đánh giá, tính trung bình rating
        productRating =
          updateReviews.reduce((acc, item) => acc + item.rating, 0) /
          numReviews;
      }

      // Cập nhật thông tin sản phẩm với đánh giá mới
      product.reviews = updateReviews;
      product.numReviews = numReviews;
      product.rating = parseFloat(productRating.toFixed(1));

      await product.save();

      // Phát sự kiện ProductUpdated để các service khác đồng bộ dữ liệu
      await new ProductUpdatedPublisher(natsWrapper.client).publish({
        id: product.id,
        title: product.title,
        price: product.price,
        userId: product.userId,
        image: product.images.image1,
        colors: product.colors,
        sizes: product.sizes,
        brand: product.brand,
        category: product.category,
        material: product.material,
        description: product.description,
        numReviews: product.numReviews,
        rating: product.rating,
        countInStock: product.countInStock,
        isReserved: product.isReserved,
        version: product.version
      });
    }

    res.status(200).send(product);
  }
);

export { router as deleteReviewRouter };
