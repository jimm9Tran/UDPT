// src/routes/update-product.ts

import express, { type Request, type Response } from 'express';
import { param } from 'express-validator';
import { validateRequest, NotFoundError, BadRequestError, requireAuth, adminUser } from '@jimm9tran/common';

import { Product } from '../models/product';
import { ProductUpdatedPublisher } from '../events/publishers/ProductUpdatedPublisher';
import { natsWrapper } from '../NatsWrapper';
import type { ProductAttrs } from '../types/product';
import { conditionalUploadImages, handleUploadError } from '../middleware/upload';
import { ImageUploadUtil } from '../utils/image-upload';

const router = express.Router();

router.patch(
  '/products/:id',
  requireAuth,
  adminUser,
  conditionalUploadImages,
  handleUploadError,
  // Kiểm tra id có đúng định dạng MongoDB ObjectId không
  [param('id').isMongoId().withMessage('Id sản phẩm không hợp lệ')],
  validateRequest,
  async (req: Request, res: Response) => {
    // Support backward compatibility for 'name' field
    if (!req.body.title && req.body.name) {
      req.body.title = req.body.name;
    }
    // Debug logging
    console.log('=== UPDATE PRODUCT DEBUG ===');
    console.log('Product ID:', req.params.id);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request body:', req.body);
    console.log('Files:', req.files ? (req.files as Express.Multer.File[]).map(f => f.originalname) : 'No files');
    console.log('===========================');

    // Lấy dữ liệu cập nhật từ request body (support title/name fallback)
    let {
      title,
      price,
      originalPrice,
      brand,
      category,
      subCategory,
      description,
      specifications,
      variants,
      features,
      inTheBox,
      reviews,
      numReviews,
      rating,
      countInStock,
      isReserved,
      tags,
      isActive,
      isFeatured,
      saleEndDate
    }: ProductAttrs = req.body;

    // Parse JSON strings back to objects/arrays if they come from FormData or proxy JSON
    try {
      if (typeof req.body.images === 'string') {
        req.body.images = JSON.parse(req.body.images);
      }
      if (typeof specifications === 'string') {
        specifications = JSON.parse(specifications);
      }
      if (typeof reviews === 'string') {
        reviews = JSON.parse(reviews);
      }
      if (typeof variants === 'string') {
        variants = JSON.parse(variants);
      }
      if (typeof features === 'string') {
        features = JSON.parse(features);
      }
      if (typeof inTheBox === 'string') {
        inTheBox = JSON.parse(inTheBox);
      }
      if (typeof tags === 'string') {
        tags = JSON.parse(tags);
      }
      if (typeof isActive === 'string') {
        isActive = isActive === 'true';
      }
      if (typeof isFeatured === 'string') {
        isFeatured = isFeatured === 'true';
      }
      if (typeof isReserved === 'string') {
        isReserved = isReserved === 'true';
      }
    } catch (parseError) {
      throw new BadRequestError('Invalid JSON format in request data');
    }

    // Tìm sản phẩm theo id
    const product = await Product.findById(req.params.id);

    // Nếu không tìm thấy sản phẩm thì trả về lỗi
    if (product == null) {
      throw new NotFoundError();
    }

    const files = req.files as Express.Multer.File[];
    let newImages = { ...product.images };

    // Get existing images from form data
    const existingImages: string[] = [];
    for (let i = 0; i < 4; i++) {
      const existingImageUrl = req.body[`existingImages[${i}]`];
      if (existingImageUrl && typeof existingImageUrl === 'string') {
        existingImages.push(existingImageUrl);
      }
    }

    // If we have new files or existing images, update the images
    if ((files && files.length > 0) || existingImages.length > 0) {
      try {
        let uploadedImages: any[] = [];
        
        // Upload new images if any
        if (files && files.length > 0) {
          uploadedImages = await ImageUploadUtil.uploadMultipleImages(
            files.map(file => file.buffer)
          );
        }

        // Combine existing images with new uploads
        const allImages = [...existingImages, ...uploadedImages.map(img => img?.secure_url).filter((url): url is string => url != null)];
        
        // Get old image URLs for cleanup (only if we're replacing them)
        const oldImageUrls = [
          product.images?.image1,
          product.images?.image2,
          product.images?.image3,
          product.images?.image4
        ].filter((url): url is string => url != null && url.trim() !== '');

        // Update images object
        newImages = {
          image1: allImages[0] || product.images?.image1 || '',
          image2: allImages[1] || product.images?.image2 || '',
          image3: allImages[2] || product.images?.image3 || '',
          image4: allImages[3] || product.images?.image4 || ''
        };

        // Clean up old images that are no longer used
        if (files && files.length > 0 && oldImageUrls.length > 0) {
          const imagesToDelete = oldImageUrls.filter((oldUrl): oldUrl is string => 
            oldUrl != null && !allImages.includes(oldUrl)
          );
          
          if (imagesToDelete.length > 0) {
            const publicIdsToDelete = imagesToDelete
              .map(url => ImageUploadUtil.extractPublicId(url))
              .filter((id): id is string => id !== null);
            
            if (publicIdsToDelete.length > 0) {
              await ImageUploadUtil.deleteMultipleImages(publicIdsToDelete);
            }
          }
        }
      } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
      }
    }

    // Nếu sản phẩm đang được giữ chỗ (isReserved = true)
    if (product.isReserved) {
      // TODO: Xem xét logic này nếu muốn cấm sửa sản phẩm đã được giữ chỗ
      // product.isReserved = isReserved;
      product.isReserved = isReserved ?? product.isReserved;
    }

    // Cập nhật các trường thông tin sản phẩm nếu có dữ liệu mới, nếu không giữ nguyên
    product.title = title ?? product.title;
    product.price = price ?? product.price;
    product.originalPrice = originalPrice ?? product.originalPrice;
    product.images = newImages;
    product.specifications = specifications ?? product.specifications;
    product.variants = variants ?? product.variants;
    product.brand = brand ?? product.brand;
    product.category = category ?? product.category;
    product.subCategory = subCategory ?? product.subCategory;
    product.description = description ?? product.description;
    product.features = features ?? product.features;
    product.inTheBox = inTheBox ?? product.inTheBox;
    product.reviews = reviews ?? product.reviews;
    product.numReviews = numReviews ?? product.numReviews;
    product.rating = rating ?? product.rating;
    product.countInStock = countInStock ?? product.countInStock;
    product.tags = tags ?? product.tags;
    product.isActive = isActive ?? product.isActive;
    product.isFeatured = isFeatured ?? product.isFeatured;
    product.saleEndDate = saleEndDate ? new Date(saleEndDate) : product.saleEndDate;

    // Lưu thay đổi vào database
    await product.save();

    // Temporarily disabled NATS publishing for testing
    // await new ProductUpdatedPublisher(natsWrapper.client).publish({
    //   id: product.id,
    //   title: product.title,
    //   price: product.price,
    //   userId: product.userId,
    //   image: product.images.image1,
    //   brand: product.brand,
    //   category: product.category,
    //   description: product.description,
    //   numReviews: product.numReviews,
    //   rating: product.rating,
    //   countInStock: product.countInStock,
    //   isReserved: product.isReserved,
    //   version: product.version
    // });

    // Trả về thông tin sản phẩm đã cập nhật
    res.send(product);
  }
);

export { router as updateProductRouter };
