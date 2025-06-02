// src/routes/commit-inventory.ts

import express, { type Request, type Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@jimm9tran/common';
import mongoose from 'mongoose';

import { Product } from '../models/product';

const router = express.Router();

// Commit reserved inventory (after successful payment)
router.post(
  '/api/products/commit-inventory',
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
            committedItems: [],
            message: 'Không tìm thấy sản phẩm được đặt trước với reservation ID này'
          };
        }

        const committedItems: any[] = [];

        for (const product of reservedProducts) {
          // Commit the reservation by removing reservation flags
          // The inventory count was already decremented during reservation
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
            },
            { 
              new: true, 
              session 
            }
          );

          if (updatedProduct) {
            committedItems.push({
              productId: product._id,
              title: product.title,
              finalStock: updatedProduct.countInStock,
              committedAt: new Date()
            });

            console.log(`✅ Committed reservation for ${product.title} (reservation: ${reservationId}), final stock: ${updatedProduct.countInStock}`);
          }
        }

        return {
          committedItems,
          message: `Đã xác nhận mua ${committedItems.length} sản phẩm`
        };
      });

      res.status(200).send({
        success: true,
        reservationId,
        committedItems: result.committedItems,
        message: result.message
      });

    } catch (error) {
      console.error('❌ Commit inventory failed:', error);
      throw new BadRequestError('Không thể xác nhận mua sản phẩm');
    } finally {
      await session.endSession();
    }
  }
);

export { router as commitInventoryRouter };
