// src/routes/test-create-product.ts

import express, { type Request, type Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '@jimm9tran/common';

import { Product } from '../models/product';
import type { ProductAttrs } from '../types/product';
import { uploadImages, handleUploadError, conditionalUploadImages } from '../middleware/upload';

const router = express.Router();

router.post(
  '/api/products/test',
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
      tags = [],
      countInStock,
      isFeatured = false,
      isActive = true
    } = req.body;

    // Parse JSON strings if they exist (from FormData)
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
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
    }

    console.log('🔍 Request body:', req.body);
    console.log('📁 Files:', req.files);

    // Handle uploaded images
    let images = {};
    if (req.files && Array.isArray(req.files)) {
      console.log(`📸 Processing ${req.files.length} uploaded images`);
      
      // Process uploaded files
      for (let i = 0; i < Math.min(req.files.length, 4); i++) {
        const file = req.files[i];
        if (file.cloudinaryUrl) {
          images[`image${i + 1}`] = file.cloudinaryUrl;
          console.log(`✅ Image ${i + 1} uploaded: ${file.cloudinaryUrl}`);
        }
      }
    }

    // Fill remaining image slots with empty strings
    for (let i = Object.keys(images).length + 1; i <= 4; i++) {
      images[`image${i}`] = '';
    }

    console.log('🖼️ Final images object:', images);

    const productAttrs: ProductAttrs = {
      title,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      userId: '683be6f31e48edb0bfeabb40', // Hard-coded test user ID
      images,
      specifications,
      variants,
      brand,
      category,
      subCategory,
      description,
      features,
      inTheBox,
      tags,
      countInStock: parseInt(countInStock),
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isActive: isActive === 'true' || isActive === true
    };

    console.log('🏗️ Creating product with attributes:', productAttrs);

    try {
      const product = Product.build(productAttrs);
      await product.save();

      console.log('✅ Product created successfully:', product.id);

      res.status(201).send({
        message: 'Sản phẩm đã được tạo thành công',
        product
      });
    } catch (error) {
      console.error('❌ Error creating product:', error);
      res.status(500).send({
        error: 'Lỗi khi tạo sản phẩm',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export { router as testCreateProductRouter };
