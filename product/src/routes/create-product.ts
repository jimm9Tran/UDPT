// src/routes/create-product.ts

import express, { type Request, type Response } from 'express';
import { body } from 'express-validator';
import { adminUser, requireAuth, validateRequest, BadRequestError } from '@jimm9tran/common';

import { Product } from '../models/product';
import { ProductCreatedPublisher } from '../events/publishers/ProductCreatedPublisher';
import { natsWrapper } from '../NatsWrapper';
import type { ProductAttrs } from '../types/product';
import { uploadImages, handleUploadError, conditionalUploadImages } from '../middleware/upload';
import { ImageUploadUtil } from '../utils/image-upload';

const router = express.Router();

router.post(
  '/api/products',
  // requireAuth,  // Temporarily disabled for testing
  // adminUser,    // Temporarily disabled for testing
  conditionalUploadImages,
  handleUploadError,
  [
    body('title').not().isEmpty().trim().isLength({ max: 200 }).withMessage('Tiêu đề không được để trống và tối đa 200 ký tự'),
    body('price').isFloat({ gt: 0 }).withMessage('Giá phải lớn hơn 0'),
    body('brand').not().isEmpty().withMessage('Thương hiệu không được để trống'),
    body('category').isIn([
      'smartphone', 'laptop', 'tablet', 'smartwatch', 'headphone', 
      'earphone', 'speaker', 'gaming', 'accessory', 'charger',
      'case', 'screen-protector', 'power-bank', 'cable'
    ]).withMessage('Danh mục không hợp lệ'),
    body('description').not().isEmpty().trim().isLength({ max: 2000 }).withMessage('Mô tả không được để trống và tối đa 2000 ký tự'),
    body('countInStock').isInt({ min: 0 }).withMessage('Số lượng tồn kho phải >= 0'),
    body('originalPrice').optional().isFloat({ gt: 0 }).withMessage('Giá gốc phải lớn hơn 0'),
    body('features').optional().isArray().withMessage('Tính năng phải là mảng'),
    body('inTheBox').optional().isArray().withMessage('Trong hộp phải là mảng'),
    body('tags').optional().isArray().withMessage('Tags phải là mảng')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    let {
      title,
      price,
      originalPrice,
      brand,
      category,
      subCategory,
      description,
      specifications = {},
      variants = [],
      features = [],
      inTheBox = [],
      countInStock = 0,
      tags = [],
      isActive = true,
      isFeatured = false,
      saleEndDate
    } = req.body;

    // Parse JSON strings back to objects/arrays if they come from FormData
    try {
      if (typeof specifications === 'string') {
        specifications = JSON.parse(specifications);
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
    } catch (parseError) {
      throw new BadRequestError('Invalid JSON format in request data');
    }

    const files = req.files as Express.Multer.File[];
    
    let uploadedImages: any[] = [];
    
    try {
      // Upload images to Cloudinary if files are provided
      if (files && files.length > 0) {
        uploadedImages = await ImageUploadUtil.uploadMultipleImages(
          files.map(file => file.buffer)
        );
      }

      // Create images object
      const images = {
        image1: uploadedImages[0]?.secure_url || 'https://via.placeholder.com/300',
        image2: uploadedImages[1]?.secure_url || '',
        image3: uploadedImages[2]?.secure_url || '',
        image4: uploadedImages[3]?.secure_url || ''
      };

      const product = Product.build({
        title,
        price,
        originalPrice,
        userId: '683be6f31e48edb0bfeabb40', // Hard-coded for testing - admin user ID
        images,
        specifications,
        variants,
        brand,
        category,
        subCategory,
        description,
        features,
        inTheBox,
        numReviews: 0,
        rating: 0,
        countInStock,
        isReserved: false,
        tags,
        isActive,
        isFeatured,
        saleEndDate: saleEndDate ? new Date(saleEndDate) : undefined
      });

      await product.save();

      // Temporarily disabled NATS publishing for testing
      // await new ProductCreatedPublisher(natsWrapper.client).publish({
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

      res.status(201).send(product);
    } catch (error) {
      // If product creation fails, try to clean up uploaded images
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        // This is a best effort cleanup, don't throw if it fails
        try {
          const uploadedImages = await ImageUploadUtil.uploadMultipleImages(
            files.map(file => file.buffer)
          );
          const publicIds = uploadedImages
            .map(img => ImageUploadUtil.extractPublicId(img.secure_url))
            .filter(id => id !== null) as string[];
          
          if (publicIds.length > 0) {
            await ImageUploadUtil.deleteMultipleImages(publicIds);
          }
        } catch (cleanupError) {
          console.error('Failed to cleanup images after product creation error:', cleanupError);
        }
      }
      
      throw error;
    }
  }
);

export { router as createProductRouter };
