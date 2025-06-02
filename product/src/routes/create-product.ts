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
  requireAuth,
  adminUser,
  conditionalUploadImages,
  handleUploadError,
  [
    body('title').not().isEmpty().trim().isLength({ max: 200 }).withMessage('Tiêu đề không được để trống và tối đa 200 ký tự'),
    body('name').optional().not().isEmpty().trim().isLength({ max: 200 }).withMessage('Tên sản phẩm không được để trống và tối đa 200 ký tự'),
    body('price').isFloat({ gt: 0 }).withMessage('Giá phải lớn hơn 0'),
    body('brand').not().isEmpty().withMessage('Thương hiệu không được để trống'),
    body('category').isIn([
      'smartphone', 'laptop', 'tablet', 'smartwatch', 'headphone', 
      'earphone', 'speaker', 'gaming', 'accessory', 'charger',
      'case', 'screen-protector', 'power-bank', 'cable',
      // Vietnamese categories
      'Laptop', 'Điện thoại', 'Tablet', 'Tai nghe', 'Loa', 
      'Smartwatch', 'Phụ kiện', 'PC & Linh kiện', 'Gaming', 'Apple', 'Khác'
    ]).withMessage('Danh mục không hợp lệ'),
    body('description').not().isEmpty().trim().isLength({ max: 2000 }).withMessage('Mô tả không được để trống và tối đa 2000 ký tự'),
    body('countInStock').isInt({ min: 0 }).withMessage('Số lượng tồn kho phải >= 0'),
    body('originalPrice').optional().isFloat({ gt: 0 }).withMessage('Giá gốc phải lớn hơn 0'),
    body('features').optional().custom((value) => {
      return Array.isArray(value) || typeof value === 'string';
    }).withMessage('Tính năng phải là mảng hoặc chuỗi JSON'),
    body('inTheBox').optional().custom((value) => {
      return Array.isArray(value) || typeof value === 'string';
    }).withMessage('Trong hộp phải là mảng hoặc chuỗi JSON'),
    body('tags').optional().custom((value) => {
      return Array.isArray(value) || typeof value === 'string';
    }).withMessage('Tags phải là mảng hoặc chuỗi JSON')
  ],
  // Add debug middleware to see validation errors
  (req: Request, res: Response, next: Function) => {
    console.log('=== CREATE PRODUCT DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files ? (req.files as Express.Multer.File[]).length : 'No files');
    
    // Check validation errors manually before validateRequest
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ VALIDATION ERRORS FOUND:');
      errors.array().forEach((error: any) => {
        console.log(`  - Field: ${error.path}, Value: ${error.value}, Message: ${error.msg}`);
      });
    } else {
      console.log('✅ No validation errors found');
    }
    console.log('===========================');
    next();
  },
  validateRequest,
  async (req: Request, res: Response) => {
    console.log('🚀 Starting product creation...');
    
    let uploadedImages: any[] = [];
    
    try {
      let {
        title,
        name,
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

      console.log('📝 Extracted request data:', { title, price, brand, category, countInStock });

      // Handle both title and name fields (for backward compatibility)
      if (!title && name) {
        title = name;
      }

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
        console.error('❌ JSON parsing error:', parseError);
        throw new BadRequestError('Invalid JSON format in request data');
      }

      const files = req.files as Express.Multer.File[];
      
      // Upload images to Cloudinary if files are provided
      if (files && files.length > 0) {
        console.log('📤 Uploading images...');
        uploadedImages = await ImageUploadUtil.uploadMultipleImages(
          files.map(file => file.buffer)
        );
        console.log('✅ Images uploaded successfully');
      }

      // Create images object
      const images = {
        image1: uploadedImages[0]?.secure_url || 'https://via.placeholder.com/300',
        image2: uploadedImages[1]?.secure_url || '',
        image3: uploadedImages[2]?.secure_url || '',
        image4: uploadedImages[3]?.secure_url || ''
      };

      console.log('🏗️ Building product...');
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

      console.log('💾 Saving product to database...');
      await product.save();
      console.log('✅ Product saved successfully');

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

      console.log('🎉 Product creation completed successfully');
      res.status(201).send(product);
      
    } catch (error) {
      console.error('❌ Product creation error:', error);
      
      // If product creation fails and we uploaded images, clean them up
      if (uploadedImages && uploadedImages.length > 0) {
        console.log('🧹 Cleaning up uploaded images...');
        try {
          const publicIds = uploadedImages
            .map(img => ImageUploadUtil.extractPublicId(img.secure_url))
            .filter(id => id !== null) as string[];
          
          if (publicIds.length > 0) {
            await ImageUploadUtil.deleteMultipleImages(publicIds);
            console.log('✅ Images cleaned up successfully');
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
