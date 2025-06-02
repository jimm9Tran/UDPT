// src/routes/reserve-inventory.ts

import express, { type Request, type Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@jimm9tran/common';
import mongoose from 'mongoose';

import { Product } from '../models/product';

const router = express.Router();

// Reserve inventory for checkout process
router.post(
  '/api/products/reserve-inventory',
  [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Danh sách sản phẩm không được để trống'),
    body('items.*.productId')
      .isMongoId()
      .withMessage('Id sản phẩm không hợp lệ'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Số lượng phải lớn hơn 0')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { items } = req.body;
    const reservationId = new mongoose.Types.ObjectId().toString();
    const currentTime = new Date();
    
    // Start a MongoDB session for transaction
    const session = await mongoose.startSession();
    
    try {
      let reservedItems: any[] = [];
      
      // Use transaction to ensure atomicity
      await session.withTransaction(async () => {
        const issues: any[] = [];
        
        for (const item of items) {
          const { productId, quantity } = item;
          
          // Find product and check availability within transaction
          const product = await Product.findById(productId).session(session);
          
          if (!product) {
            issues.push({
              productId,
              type: 'not_found',
              message: 'Sản phẩm không tồn tại'
            });
            continue;
          }

          if (product.isReserved) {
            issues.push({
              productId,
              title: product.title,
              type: 'already_reserved',
              message: 'Sản phẩm đã được đặt trước'
            });
            continue;
          }

          if (product.countInStock < quantity) {
            issues.push({
              productId,
              title: product.title,
              type: 'insufficient_stock',
              requestedQuantity: quantity,
              availableQuantity: product.countInStock,
              message: `Chỉ còn ${product.countInStock} sản phẩm, không đủ số lượng yêu cầu (${quantity})`
            });
            continue;
          }

          // Try to reserve the product using atomic update within transaction
          const updatedProduct = await Product.findOneAndUpdate(
            {
              _id: product._id,
              countInStock: { $gte: quantity },
              isReserved: false
            },
            {
              $set: {
                isReserved: true,
                reservedAt: currentTime,
                reservedBy: req.currentUser?.id || 'anonymous',
                orderId: reservationId
              },
              $inc: { countInStock: -quantity, version: 1 }
            },
            { 
              new: true,
              session
            }
          );

          if (!updatedProduct) {
            issues.push({
              productId,
              title: product.title,
              type: 'reservation_failed',
              message: 'Không thể đặt trước sản phẩm (có thể đã được người khác mua)'
            });
            continue;
          }

          reservedItems.push({
            productId,
            title: updatedProduct.title,
            quantity,
            reservedAt: currentTime
          });

          console.log(`✅ Reserved ${quantity} of ${updatedProduct.title} for reservation ${reservationId}`);
        }

        // If there are any issues, throw error to abort transaction
        if (issues.length > 0) {
          throw new BadRequestError(`Không thể đặt trước một số sản phẩm: ${JSON.stringify(issues)}`);
        }
      });

      res.status(200).send({
        success: true,
        reservationId: reservationId,
        reservedItems: reservedItems,
        message: `Đã đặt trước ${reservedItems.length} sản phẩm thành công`,
        expiresAt: new Date(currentTime.getTime() + 30 * 60 * 1000) // 30 minutes
      });

    } catch (error) {
      console.error('❌ Reservation failed:', error);
      
      if (error instanceof BadRequestError) {
        throw error;
      }
      
      throw new BadRequestError('Không thể đặt trước sản phẩm');
    } finally {
      await session.endSession();
    }
  }
);

export { router as reserveInventoryRouter };
