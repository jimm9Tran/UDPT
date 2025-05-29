import express, { type Request, type Response } from 'express';
import { body, param } from 'express-validator';
import { BadRequestError, NotFoundError, requireAuth, validateRequest } from '@jimm9tran/common';

import { Product } from '../models/product';
import { Review } from '../models/review';
import { ProductUpdatedPublisher } from '../events/publishers/ProductUpdatedPublisher';
import { natsWrapper } from '../NatWapper';
import type { ReviewAttrs } from '../types/review';

const router = express.Router();

router.post(
  '/api/products/:productId/reviews',
  requireAuth,
  [
    // Validate đầu vào
    body('title').not().isEmpty().withMessage('Tiêu đề đánh giá không được để trống'),
    body('rating')
      .not()
      .isEmpty()
      .isFloat({ gt: 0, max: 5 })
      .withMessage('Đánh giá phải từ 1 đến 5 sao'),
    body('comment').not().isEmpty().withMessage('Nội dung đánh giá không được để trống'),
    param('productId').isMongoId().withMessage('Id sản phẩm không hợp lệ')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, rating, comment }: ReviewAttrs = req.body;

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(req.params.productId);

    if (product == null) {
      throw new NotFoundError();
    }

    if (product.reviews != null) {
      // Kiểm tra người dùng đã đánh giá sản phẩm này chưa
      const alreadyReviewed = product.reviews.find(
        (review) => review.userId.toString() === req.currentUser!.id
      );

      if (alreadyReviewed != null) {
        throw new BadRequestError('Bạn đã đánh giá sản phẩm này rồi');
      }

      // TODO: Kiểm tra người dùng đã mua sản phẩm thành công trước khi cho đánh giá

      // Tạo đánh giá mới
      const review = Review.build({
        title,
        rating,
        comment,
        userId: req.currentUser!.id,
        productTitle: product.title,
        productId: product.id
      });

      // Lưu đánh giá vào database
      await review.save();

      // Thêm đánh giá vào mảng reviews của sản phẩm
      product.reviews.push(review);

      // Tính toán lại số lượng đánh giá và điểm trung bình của sản phẩm
      let numReviews;
      let productRating;
      if (product.reviews.length !== 0) {
        numReviews = product.reviews?.length;
        productRating =
          product.reviews.reduce((acc, item) => item.rating + acc, 0) /
          numReviews;
      } else {
        numReviews = 0;
        productRating =
          product.reviews.reduce((acc, item) => item.rating + acc, 0) / 1;
      }

      // Cập nhật thông tin sản phẩm
      product.numReviews = numReviews ?? product.numReviews;
      product.rating = parseFloat(productRating.toFixed(1)) ?? product.rating;

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

      res.status(201).send(review);
    }
  }
);

export { router as createReviewRouter };
