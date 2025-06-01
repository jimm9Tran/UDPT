// src/routes/check-inventory.ts

import express, { type Request, type Response } from 'express';
import { param, body } from 'express-validator';
import { validateRequest, NotFoundError } from '@jimm9tran/common';

import { Product } from '../models/product';

const router = express.Router();

// Check single product inventory
router.get(
  '/api/products/:id/inventory',
  [param('id').isMongoId().withMessage('Id sản phẩm không hợp lệ')],
  validateRequest,
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new NotFoundError();
    }

    res.send({
      productId: product.id,
      countInStock: product.countInStock,
      isReserved: product.isReserved,
      isAvailable: product.countInStock > 0 && !product.isReserved
    });
  }
);

// Check multiple products inventory
router.post(
  '/api/products/check-inventory',
  [
    body('productIds')
      .isArray({ min: 1 })
      .withMessage('Danh sách sản phẩm không được để trống'),
    body('productIds.*')
      .isMongoId()
      .withMessage('Id sản phẩm không hợp lệ')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { productIds } = req.body;

    const products = await Product.find({
      _id: { $in: productIds }
    }).select('_id countInStock isReserved title');

    const inventory = products.map(product => ({
      productId: product.id,
      title: product.title,
      countInStock: product.countInStock,
      isReserved: product.isReserved,
      isAvailable: product.countInStock > 0 && !product.isReserved
    }));

    // Check for missing products
    const foundIds = products.map(p => p.id);
    const missingIds = productIds.filter((id: string) => !foundIds.includes(id));

    res.send({
      inventory,
      missingProducts: missingIds
    });
  }
);

// Check cart inventory
router.post(
  '/api/products/check-cart-inventory',
  [
    body('cart')
      .isArray({ min: 1 })
      .withMessage('Giỏ hàng không được để trống'),
    body('cart.*.productId')
      .isMongoId()
      .withMessage('Id sản phẩm không hợp lệ'),
    body('cart.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Số lượng phải lớn hơn 0')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { cart } = req.body;

    const productIds = cart.map((item: any) => item.productId);
    const products = await Product.find({
      _id: { $in: productIds }
    }).select('_id countInStock isReserved title');

    const issues: any[] = [];
    const validItems: any[] = [];

    for (const cartItem of cart) {
      const product = products.find(p => p.id === cartItem.productId);
      
      if (!product) {
        issues.push({
          productId: cartItem.productId,
          type: 'not_found',
          message: 'Sản phẩm không tồn tại'
        });
        continue;
      }

      if (product.isReserved) {
        issues.push({
          productId: cartItem.productId,
          title: product.title,
          type: 'reserved',
          message: 'Sản phẩm đã được đặt trước'
        });
        continue;
      }

      if (product.countInStock <= 0) {
        issues.push({
          productId: cartItem.productId,
          title: product.title,
          type: 'out_of_stock',
          message: 'Sản phẩm đã hết hàng'
        });
        continue;
      }

      if (cartItem.quantity > product.countInStock) {
        issues.push({
          productId: cartItem.productId,
          title: product.title,
          type: 'insufficient_stock',
          requestedQuantity: cartItem.quantity,
          availableQuantity: product.countInStock,
          message: `Chỉ còn ${product.countInStock} sản phẩm, không đủ số lượng yêu cầu (${cartItem.quantity})`
        });
        continue;
      }

      validItems.push({
        productId: cartItem.productId,
        title: product.title,
        quantity: cartItem.quantity,
        countInStock: product.countInStock
      });
    }

    res.send({
      isValid: issues.length === 0,
      issues,
      validItems,
      summary: {
        totalItems: cart.length,
        validItems: validItems.length,
        issueItems: issues.length
      }
    });
  }
);

export { router as checkInventoryRouter };
