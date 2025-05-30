// src/routes/update-product.ts

import express, { type Request, type Response } from 'express';
import { param } from 'express-validator';
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  adminUser
} from '@jimm9tran/common';

import { Product } from '../models/product';
import { ProductUpdatedPublisher } from '../events/publishers/ProductUpdatedPublisher';
import { natsWrapper } from '../NatsWrapper';
import type { ProductAttrs } from '../types/product';

const router = express.Router();

router.patch(
  '/api/products/:id',
  requireAuth,
  adminUser,
  // Kiểm tra id có đúng định dạng MongoDB ObjectId không
  [param('id').isMongoId().withMessage('Id sản phẩm không hợp lệ')],
  validateRequest,
  async (req: Request, res: Response) => {
    // Lấy dữ liệu cập nhật từ request body
    const {
      title,
      price,
      image1,
      image2,
      image3,
      image4,
      colors,
      sizes,
      brand,
      category,
      material,
      description,
      reviews,
      numReviews,
      rating,
      countInStock,
      isReserved
    }: {
      image1: string
      image2: string
      image3: string
      image4: string
    } & ProductAttrs = req.body;

    // Tìm sản phẩm theo id
    const product = await Product.findById(req.params.id);

    // Nếu không tìm thấy sản phẩm thì trả về lỗi
    if (product == null) {
      throw new NotFoundError();
    }

    // Nếu sản phẩm đang được giữ chỗ (isReserved = true)
    if (product.isReserved) {
      // TODO: Xem xét logic này nếu muốn cấm sửa sản phẩm đã được giữ chỗ
      // product.isReserved = isReserved;
      product.isReserved = isReserved;
    }

    // Cập nhật các trường thông tin sản phẩm nếu có dữ liệu mới, nếu không giữ nguyên
    product.title = title ?? product.title;
    product.price = price ?? product.price;
    product.images = {
      image1: image1 ?? product.images.image1,
      image2: image2 ?? product.images.image2,
      image3: image3 ?? product.images.image3,
      image4: image4 ?? product.images.image4
    };
    product.colors = colors ?? product.colors;
    product.sizes = sizes ?? product.sizes;
    product.brand = brand ?? product.brand;
    product.category = category ?? product.category;
    product.material = material ?? product.material;
    product.description = description ?? product.description;
    product.reviews = reviews ?? product.reviews;
    product.numReviews = numReviews ?? product.numReviews;
    product.rating = rating ?? product.rating;
    product.countInStock = countInStock ?? product.countInStock;

    // Lưu thay đổi vào database
    await product.save();

    // Phát sự kiện ProductUpdated để các service khác đồng bộ trạng thái sản phẩm
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

    // Trả về thông tin sản phẩm đã cập nhật
    res.send(product);
  }
);

export { router as updateProductRouter };
