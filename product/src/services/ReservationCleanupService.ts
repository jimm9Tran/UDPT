import cron from 'node-cron';
import { Product } from '../models/product';

class ReservationCleanupService {
  private static instance: ReservationCleanupService;
  private isRunning = false;

  private constructor() {}

  public static getInstance(): ReservationCleanupService {
    if (!ReservationCleanupService.instance) {
      ReservationCleanupService.instance = new ReservationCleanupService();
    }
    return ReservationCleanupService.instance;
  }

  public startCleanupCron(): void {
    if (this.isRunning) {
      console.log('⚠️ Cleanup cron is already running');
      return;
    }

    // Chạy mỗi 5 phút để cleanup các reservations hết hạn
    const cronJob = cron.schedule('*/5 * * * *', async () => {
      await this.cleanupExpiredReservations();
    }, {
      timezone: "Asia/Ho_Chi_Minh"
    });

    // Chạy lần đầu ngay khi start
    this.cleanupExpiredReservations();

    this.isRunning = true;
    console.log('🚀 Reservation cleanup cron started - running every 5 minutes');
  }

  public stopCleanupCron(): void {
    this.isRunning = false;
    console.log('🛑 Reservation cleanup cron stopped');
  }

  private async cleanupExpiredReservations(): Promise<void> {
    try {
      const RESERVATION_TIMEOUT = 30 * 60 * 1000; // 30 phút
      const expiredTime = new Date(Date.now() - RESERVATION_TIMEOUT);

      // Tìm các sản phẩm bị reserve quá lâu
      const expiredReservations = await Product.find({
        isReserved: true,
        reservedAt: { $lt: expiredTime }
      }).select('_id title reservedAt reservedBy');

      if (expiredReservations.length === 0) {
        console.log('✅ No expired reservations found');
        return;
      }

      console.log(`🔍 Found ${expiredReservations.length} expired reservations:`);
      expiredReservations.forEach(product => {
        console.log(`  - ${product.title} (reserved at: ${product.reservedAt})`);
      });

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

      console.log(`✅ Successfully cleaned up ${result.modifiedCount} expired reservations`);

      // Log danh sách sản phẩm đã được cleanup
      if (result.modifiedCount > 0) {
        expiredReservations.forEach(product => {
          console.log(`  ✓ Released: ${product.title}`);
        });
      }

    } catch (error) {
      console.error('❌ Error during reservation cleanup:', error);
    }
  }

  // Method để cleanup thủ công
  public async manualCleanup(): Promise<{
    success: boolean;
    cleanedCount: number;
    message: string;
  }> {
    try {
      const RESERVATION_TIMEOUT = 30 * 60 * 1000;
      const expiredTime = new Date(Date.now() - RESERVATION_TIMEOUT);

      const expiredReservations = await Product.find({
        isReserved: true,
        reservedAt: { $lt: expiredTime }
      });

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

      return {
        success: true,
        cleanedCount: result.modifiedCount,
        message: `Đã cleanup ${result.modifiedCount} reservations hết hạn`
      };
    } catch (error) {
      return {
        success: false,
        cleanedCount: 0,
        message: `Lỗi khi cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export default ReservationCleanupService;
