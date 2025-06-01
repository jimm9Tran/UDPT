import express, { type Request, type Response } from 'express';
import { requireAuth, adminUser, OrderStatus } from '@jimm9tran/common';
import { body } from 'express-validator';
import { Order } from '../models/order';

const router = express.Router();

// Get all orders for admin
router.get(
  '/api/orders/admin',
  requireAuth,
  adminUser,
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};
      if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
        filter.status = status;
      }

      const orders = await Order.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Order.countDocuments(filter);

      res.send({
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).send({ error: 'Lỗi khi lấy danh sách đơn hàng' });
    }
  }
);

// Update order status
router.patch(
  '/api/orders/:orderId/status',
  requireAuth,
  adminUser,
  [
    body('status')
      .isIn(Object.values(OrderStatus))
      .withMessage('Trạng thái đơn hàng không hợp lệ')
  ],
  async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).send({ error: 'Không tìm thấy đơn hàng' });
      }

      // Business logic for status transitions
      const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.Created]: [OrderStatus.Pending, OrderStatus.Cancelled],
        [OrderStatus.Pending]: [OrderStatus.Completed, OrderStatus.Cancelled],
        [OrderStatus.Completed]: [], // Cannot change from complete
        [OrderStatus.Cancelled]: [] // Cannot change from cancelled
      };

      if (!allowedTransitions[order.status].includes(status)) {
        return res.status(400).send({ 
          error: `Không thể thay đổi từ trạng thái ${order.status} sang ${status}` 
        });
      }

      order.status = status;
      await order.save();

      res.send({
        message: 'Cập nhật trạng thái đơn hàng thành công',
        order
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).send({ error: 'Lỗi khi cập nhật trạng thái đơn hàng' });
    }
  }
);

// Get order statistics for admin dashboard
router.get(
  '/api/orders/admin/stats',
  requireAuth,
  adminUser,
  async (req: Request, res: Response) => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const [
        totalOrders,
        todayOrders,
        weekOrders,
        monthOrders,
        statusStats,
        revenueStats
      ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: startOfDay } }),
        Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
        Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
        Order.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Order.aggregate([
          { $match: { status: OrderStatus.Completed } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$totalPrice' },
              avgOrderValue: { $avg: '$totalPrice' }
            }
          }
        ])
      ]);

      res.send({
        orders: {
          total: totalOrders,
          today: todayOrders,
          week: weekOrders,
          month: monthOrders
        },
        statusBreakdown: statusStats,
        revenue: revenueStats[0] || { totalRevenue: 0, avgOrderValue: 0 }
      });
    } catch (error) {
      console.error('Error fetching order stats:', error);
      res.status(500).send({ error: 'Lỗi khi lấy thống kê đơn hàng' });
    }
  }
);

export { router as adminOrderRouter };
