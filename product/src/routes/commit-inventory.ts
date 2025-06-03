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
        console.log('✅ MongoDB transactions supported for commit, using transaction mode');
      } catch (error) {
        console.log('⚠️  Transactions failed in production for commit, falling back to atomic operations');
        useTransaction = false;
        if (session) {
          await session.endSession();
          session = null;
        }
      }
    } else {
      console.log('⚠️  Development mode: using atomic operations only for commit (no transactions)');
    }
    
    try {
      const executeCommit = async () => {
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
            committedItems: [],
            message: 'Không tìm thấy sản phẩm được đặt trước với reservation ID này'
          };
        }

        const committedItems: any[] = [];

        for (const product of reservedProducts) {
          // Find the specific reservation
          const reservation = product.reservations?.find(r => r.reservationId === reservationId);
          
          if (!reservation) {
            continue;
          }

          // Commit the reservation: decrease actual stock and remove reservation
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
                    countInStock: -reservation.quantity,
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
                    countInStock: -reservation.quantity,
                    reservedQuantity: -reservation.quantity,
                    version: 1
                  }
                },
                { 
                  new: true
                }
              );

          if (updatedProduct) {
            committedItems.push({
              productId: product._id,
              title: product.title,
              soldQuantity: reservation.quantity,
              finalStock: updatedProduct.countInStock,
              availableStock: updatedProduct.countInStock - (updatedProduct.reservedQuantity || 0),
              committedAt: new Date()
            });

            console.log(`✅ Committed ${reservation.quantity} units of ${product.title} (reservation: ${reservationId}). Final stock: ${updatedProduct.countInStock}, Available: ${updatedProduct.countInStock - (updatedProduct.reservedQuantity || 0)}`);
          }
        }

        return {
          committedItems,
          message: `Đã xác nhận mua ${committedItems.length} sản phẩm`
        };
      };

      // Execute commit with or without transaction
      let result;
      if (useTransaction && session) {
        result = await session.withTransaction(executeCommit);
      } else {
        result = await executeCommit();
      }

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
      if (session) {
        await session.endSession();
      }
    }
  }
);

export { router as commitInventoryRouter };
