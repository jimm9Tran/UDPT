import express, { type Request, type Response } from 'express';
import { requireAuth, adminUser } from '@jimm9tran/common';
import { Product } from '../models/product';

const router = express.Router();

// Route để cleanup các reservations đã hết hạn (chỉ admin)
router.post(
  '/api/products/cleanup-reservations',
  requireAuth,
  adminUser,
  async (req: Request, res: Response) => {
    try {
      const RESERVATION_TIMEOUT = 30 * 60 * 1000; // 30 phút timeout
      const expiredTime = new Date(Date.now() - RESERVATION_TIMEOUT);

      // Tìm các sản phẩm bị reserve quá lâu
      const expiredReservations = await Product.find({
        isReserved: true,
        reservedAt: { $lt: expiredTime }
      });

      console.log(`🔍 Found ${expiredReservations.length} expired reservations`);

      // Cleanup các reservations đã hết hạn
      const result = await Product.updateMany(
        {
          isReserved: true,
          reservedAt: { $lt: expiredTime }
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
        }
      );

      console.log(`✅ Cleaned up ${result.modifiedCount} expired reservations`);

      res.send({
        success: true,
        message: `Đã cleanup ${result.modifiedCount} reservations hết hạn`,
        cleanedCount: result.modifiedCount,
        foundExpired: expiredReservations.length
      });
    } catch (error) {
      console.error('❌ Error cleaning up reservations:', error);
      res.status(500).send({
        success: false,
        message: 'Lỗi khi cleanup reservations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Route để kiểm tra trạng thái reservations
router.get(
  '/api/products/reservation-status',
  requireAuth,
  adminUser,
  async (req: Request, res: Response) => {
    try {
      const totalProducts = await Product.countDocuments();
      const reservedProducts = await Product.countDocuments({ isReserved: true });
      const outOfStockProducts = await Product.countDocuments({ countInStock: 0 });
      
      const RESERVATION_TIMEOUT = 30 * 60 * 1000;
      const expiredTime = new Date(Date.now() - RESERVATION_TIMEOUT);
      const expiredReservations = await Product.countDocuments({
        isReserved: true,
        reservedAt: { $lt: expiredTime }
      });

      res.send({
        totalProducts,
        reservedProducts,
        outOfStockProducts,
        expiredReservations,
        healthyProducts: totalProducts - reservedProducts,
        needsCleanup: expiredReservations > 0
      });
    } catch (error) {
      console.error('❌ Error getting reservation status:', error);
      res.status(500).send({
        success: false,
        message: 'Lỗi khi lấy trạng thái reservations'
      });
    }
  }
);

export { router as cleanupReservationsRouter };
