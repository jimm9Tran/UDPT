// src/routes/cleanup-expired-reservations.ts

import express, { type Request, type Response } from 'express';
import { BadRequestError } from '@jimm9tran/common';
import mongoose from 'mongoose';

import { Product } from '../models/product';

const router = express.Router();

// Clean up expired reservations (should be called periodically)
router.post(
  '/api/products/cleanup-expired-reservations',
  async (req: Request, res: Response) => {
    const currentTime = new Date();
    
    // Start MongoDB transaction
    const session = await mongoose.startSession();
    
    try {
      const result = await session.withTransaction(async () => {
        // Find all products with expired reservations
        const productsWithExpiredReservations = await Product.find({
          'reservations.expiresAt': { $lt: currentTime }
        }).session(session);

        let totalCleanedReservations = 0;
        const cleanupResults: any[] = [];

        for (const product of productsWithExpiredReservations) {
          const expiredReservations = product.reservations?.filter(r => r.expiresAt < currentTime) || [];
          
          if (expiredReservations.length === 0) {
            continue;
          }

          // Calculate total expired quantity
          const totalExpiredQuantity = expiredReservations.reduce((sum, r) => sum + r.quantity, 0);

          // Remove expired reservations and adjust reserved quantity
          const updatedProduct = await Product.findOneAndUpdate(
            {
              _id: product._id
            },
            {
              $pull: {
                reservations: { expiresAt: { $lt: currentTime } }
              },
              $inc: {
                reservedQuantity: -totalExpiredQuantity,
                version: 1
              }
            },
            { 
              new: true, 
              session 
            }
          );

          if (updatedProduct) {
            cleanupResults.push({
              productId: product._id,
              title: product.title,
              expiredReservations: expiredReservations.length,
              releasedQuantity: totalExpiredQuantity,
              availableAfterCleanup: updatedProduct.countInStock - (updatedProduct.reservedQuantity || 0)
            });

            totalCleanedReservations += expiredReservations.length;

            console.log(`🧹 Cleaned up ${expiredReservations.length} expired reservations for ${product.title}, released ${totalExpiredQuantity} units. Available: ${updatedProduct.countInStock - (updatedProduct.reservedQuantity || 0)}/${updatedProduct.countInStock}`);
          }
        }

        return {
          cleanupResults,
          totalCleanedReservations,
          message: `Đã dọn dẹp ${totalCleanedReservations} đặt trước hết hạn từ ${cleanupResults.length} sản phẩm`
        };
      });

      res.status(200).send({
        success: true,
        cleanedAt: currentTime,
        totalCleanedReservations: result.totalCleanedReservations,
        affectedProducts: result.cleanupResults.length,
        cleanupResults: result.cleanupResults,
        message: result.message
      });

    } catch (error) {
      console.error('❌ Cleanup expired reservations failed:', error);
      throw new BadRequestError('Không thể dọn dẹp đặt trước hết hạn');
    } finally {
      await session.endSession();
    }
  }
);

export { router as cleanupExpiredReservationsRouter };
