// src/routes/release-inventory.ts

import express, { type Request, type Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@jimm9tran/common';
import mongoose from 'mongoose';

import { Product } from '../models/product';

const router = express.Router();

// Release reserved inventory (when checkout is cancelled or times out)
router.post(
  '/api/products/release-inventory',
  [
    body('reservationId')
      .not()
      .isEmpty()
      .withMessage('Reservation ID không được để trống')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { reservationId } = req.body;
    
    // Start MongoDB transaction
    const session = await mongoose.startSession();
    
    try {
      const result = await session.withTransaction(async () => {
        // Find all products reserved with this reservation ID
        const reservedProducts = await Product.find({
          isReserved: true,
          orderId: reservationId
        }).session(session);

        if (reservedProducts.length === 0) {
          return {
            releasedItems: [],
            message: 'Không tìm thấy sản phẩm được đặt trước với reservation ID này'
          };
        }

        const releasedItems: any[] = [];

        for (const product of reservedProducts) {
          // Calculate the quantity that was reserved (need to restore it)
          // Since we don't store the reserved quantity, we need to get it from the original reservation
          // For now, we'll restore the product to available state
          
          const updatedProduct = await Product.findOneAndUpdate(
            {
              _id: product._id,
              version: product.version,
              isReserved: true,
              orderId: reservationId
            },
            {
              $unset: {
                reservedAt: 1,
                reservedBy: 1,
                orderId: 1
              },
              $set: {
                isReserved: false
              }
              // Note: We're not restoring countInStock here because we need the original quantity
              // In a production system, you'd want to store the reserved quantity separately
            },
            { 
              new: true, 
              session 
            }
          );

          if (updatedProduct) {
            releasedItems.push({
              productId: product._id,
              title: product.title,
              releasedAt: new Date()
            });

            console.log(`✅ Released reservation for ${product.title} (reservation: ${reservationId})`);
          }
        }

        return {
          releasedItems,
          message: `Đã hủy đặt trước ${releasedItems.length} sản phẩm`
        };
      });

      res.status(200).send({
        success: true,
        reservationId,
        releasedItems: result.releasedItems,
        message: result.message
      });

    } catch (error) {
      console.error('❌ Release inventory failed:', error);
      throw new BadRequestError('Không thể hủy đặt trước sản phẩm');
    } finally {
      await session.endSession();
    }
  }
);

export { router as releaseInventoryRouter };
