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
        console.log('✅ MongoDB transactions supported for release, using transaction mode');
      } catch (error) {
        console.log('⚠️  Transactions failed in production for release, falling back to atomic operations');
        useTransaction = false;
        if (session) {
          await session.endSession();
          session = null;
        }
      }
    } else {
      console.log('⚠️  Development mode: using atomic operations only for release (no transactions)');
    }
    
    try {
      const executeRelease = async () => {
        // Find all products that have reservations with this reservation ID
        const reservedProducts = useTransaction && session
          ? await Product.find({
              'reservations.reservationId': reservationId
            }).session(session)
          : await Product.find({
              'reservations.reservationId': reservationId
            });

        if (reservedProducts.length === 0) {
          return {
            releasedItems: [],
            message: 'Không tìm thấy sản phẩm được đặt trước với reservation ID này'
          };
        }

        const releasedItems: any[] = [];

        for (const product of reservedProducts) {
          // Find the specific reservation
          const reservation = product.reservations?.find(r => r.reservationId === reservationId);
          
          if (!reservation) {
            continue;
          }

          // Remove the reservation and decrease reserved quantity
          const updatedProduct = useTransaction && session
            ? await Product.findOneAndUpdate(
                {
                  _id: product._id,
                  'reservations.reservationId': reservationId
                },
                {
                  $pull: {
                    reservations: { reservationId: reservationId }
                  },
                  $inc: {
                    reservedQuantity: -reservation.quantity,
                    version: 1
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
                  'reservations.reservationId': reservationId
                },
                {
                  $pull: {
                    reservations: { reservationId: reservationId }
                  },
                  $inc: {
                    reservedQuantity: -reservation.quantity,
                    version: 1
                  }
                },
                { 
                  new: true
                }
              );

          if (updatedProduct) {
            releasedItems.push({
              productId: product._id,
              title: product.title,
              releasedQuantity: reservation.quantity,
              releasedAt: new Date(),
              availableAfterRelease: updatedProduct.countInStock - (updatedProduct.reservedQuantity || 0)
            });

            console.log(`✅ Released ${reservation.quantity} units of ${product.title} (reservation: ${reservationId}). Available: ${updatedProduct.countInStock - (updatedProduct.reservedQuantity || 0)}/${updatedProduct.countInStock}`);
          }
        }

        return {
          releasedItems,
          message: `Đã hủy đặt trước ${releasedItems.length} sản phẩm`
        };
      };

      // Execute release with or without transaction
      let result;
      if (useTransaction && session) {
        result = await session.withTransaction(executeRelease);
      } else {
        result = await executeRelease();
      }

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
      if (session) {
        await session.endSession();
      }
    }
  }
);

export { router as releaseInventoryRouter };
