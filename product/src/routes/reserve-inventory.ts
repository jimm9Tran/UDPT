import express, { type Request, type Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@jimm9tran/common';
import mongoose from 'mongoose';

import { Product } from '../models/product';

const router = express.Router();

// Reserve inventory for checkout process with quantity-based reservations
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
    const expirationTime = new Date(currentTime.getTime() + 30 * 60 * 1000); // 30 minutes
    
    // Check if we can use transactions (requires replica set)
    let session: mongoose.ClientSession | null = null;
    let useTransaction = false;
    
    // For development, we'll skip transactions and use atomic operations only
    if (process.env.NODE_ENV === 'production') {
      try {
        session = await mongoose.startSession();
        // Test if transactions work in production
        await session.withTransaction(async () => {
          // Empty transaction test
        });
        useTransaction = true;
        console.log('✅ MongoDB transactions supported, using transaction mode');
      } catch (error) {
        console.log('⚠️  Transactions failed in production, falling back to atomic operations');
        useTransaction = false;
        if (session) {
          await session.endSession();
          session = null;
        }
      }
    } else {
      console.log('⚠️  Development mode: using atomic operations only (no transactions)');
    }
    
    try {
      let reservedItems: any[] = [];
      
      const executeReservation = async () => {
        const issues: any[] = [];
        
        for (const item of items) {
          const { productId, quantity } = item;
          
          // Find product and check availability
          const product = useTransaction && session 
            ? await Product.findById(productId).session(session)
            : await Product.findById(productId);
          
          if (!product) {
            issues.push({
              productId,
              type: 'not_found',
              message: 'Sản phẩm không tồn tại'
            });
            continue;
          }

          // Calculate available quantity (total stock - reserved quantity)
          const availableQuantity = product.countInStock - (product.reservedQuantity || 0);

          if (availableQuantity < quantity) {
            issues.push({
              productId,
              title: product.title,
              type: 'insufficient_stock',
              requestedQuantity: quantity,
              availableQuantity: availableQuantity,
              totalStock: product.countInStock,
              reservedQuantity: product.reservedQuantity || 0,
              message: `Chỉ còn ${availableQuantity} sản phẩm có sẵn (tổng: ${product.countInStock}, đã đặt trước: ${product.reservedQuantity || 0}), không đủ số lượng yêu cầu (${quantity})`
            });
            continue;
          }

          // Try to reserve the product using atomic update
          const updatedProduct = useTransaction && session
            ? await Product.findOneAndUpdate(
                {
                  _id: product._id,
                  $expr: {
                    $gte: [
                      { $subtract: ['$countInStock', { $ifNull: ['$reservedQuantity', 0] }] },
                      quantity
                    ]
                  }
                },
                {
                  $inc: { 
                    reservedQuantity: quantity,
                    version: 1 
                  },
                  $push: {
                    reservations: {
                      reservationId: reservationId,
                      quantity: quantity,
                      userId: req.currentUser?.id || 'anonymous',
                      reservedAt: currentTime,
                      expiresAt: expirationTime
                    }
                  }
                },
                { 
                  new: true,
                  session
                }
              )
            : await Product.findOneAndUpdate(
                {
                  _id: product._id,
                  $expr: {
                    $gte: [
                      { $subtract: ['$countInStock', { $ifNull: ['$reservedQuantity', 0] }] },
                      quantity
                    ]
                  }
                },
                {
                  $inc: { 
                    reservedQuantity: quantity,
                    version: 1 
                  },
                  $push: {
                    reservations: {
                      reservationId: reservationId,
                      quantity: quantity,
                      userId: req.currentUser?.id || 'anonymous',
                      reservedAt: currentTime,
                      expiresAt: expirationTime
                    }
                  }
                },
                { 
                  new: true
                }
              );

          if (!updatedProduct) {
            issues.push({
              productId,
              title: product.title,
              type: 'reservation_failed',
              message: 'Không thể đặt trước sản phẩm (có thể đã được người khác mua hoặc hết hàng)'
            });
            continue;
          }

          reservedItems.push({
            productId,
            title: updatedProduct.title,
            quantity,
            reservedAt: currentTime,
            expiresAt: expirationTime,
            availableAfterReservation: updatedProduct.countInStock - updatedProduct.reservedQuantity
          });

          console.log(`✅ Reserved ${quantity} of ${updatedProduct.title} for reservation ${reservationId}. Available: ${updatedProduct.countInStock - updatedProduct.reservedQuantity}/${updatedProduct.countInStock}`);
        }

        // If there are any issues, throw error to abort transaction
        if (issues.length > 0) {
          throw new BadRequestError(`Không thể đặt trước một số sản phẩm: ${JSON.stringify(issues)}`);
        }
      };

      // Execute reservation with or without transaction
      if (useTransaction && session) {
        await session.withTransaction(executeReservation);
      } else {
        await executeReservation();
      }

      res.status(200).send({
        success: true,
        reservationId: reservationId,
        reservedItems: reservedItems,
        message: `Đã đặt trước ${reservedItems.length} sản phẩm thành công`,
        expiresAt: expirationTime
      });

    } catch (error) {
      console.error('❌ Reservation failed:', error);
      
      if (error instanceof BadRequestError) {
        throw error;
      }
      
      throw new BadRequestError('Không thể đặt trước sản phẩm');
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }
);

export { router as reserveInventoryRouter };
