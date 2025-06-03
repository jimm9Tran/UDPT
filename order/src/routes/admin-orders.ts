import express from 'express';
import { Request, Response } from 'express';
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
    console.log('🔍 Admin Orders API - Debug Info:');
    console.log('   Headers:', req.headers.authorization ? 'Bearer token present' : 'No Bearer token');
    console.log('   Session JWT:', req.session?.jwt ? 'Present' : 'Missing');
    console.log('   Current User:', req.currentUser ? 
      `${req.currentUser.email} (isAdmin: ${req.currentUser.isAdmin})` : 'Not set');
    
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const search = req.query.search as string;
      const dateRange = req.query.dateRange as string;
      const sortBy = req.query.sortBy as string || 'createdAt';
      const sortOrder = req.query.sortOrder as string || 'desc';
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};
      
      // Status filter
      if (status && status !== 'all' && Object.values(OrderStatus).includes(status as OrderStatus)) {
        filter.status = status;
      }

      // Date range filter
      if (dateRange && dateRange !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        }
        
        if (startDate) {
          filter.createdAt = { $gte: startDate };
        }
      }

      // Search filter (order ID or shipping address name)
      if (search) {
        filter.$or = [
          { _id: { $regex: search, $options: 'i' } },
          { 'shippingAddress.name': { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      const sortObj: any = {};
      sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const orders = await Order.find(filter)
        .populate('userId', 'name email')
        .sort(sortObj)
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

// Get all orders for admin (alias route for frontend compatibility)
router.get(
  '/api/orders/all',
  requireAuth,
  adminUser,
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const search = req.query.search as string;
      const dateRange = req.query.dateRange as string;
      const sortBy = req.query.sortBy as string || 'createdAt';
      const sortOrder = req.query.sortOrder as string || 'desc';
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};
      
      // Status filter
      if (status && status !== 'all' && Object.values(OrderStatus).includes(status as OrderStatus)) {
        filter.status = status;
      }

      // Date range filter
      if (dateRange && dateRange !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        }
        
        if (startDate) {
          filter.createdAt = { $gte: startDate };
        }
      }

      // Search filter (order ID or shipping address name)
      if (search) {
        filter.$or = [
          { _id: { $regex: search, $options: 'i' } },
          { 'shippingAddress.name': { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      const sortObj: any = {};
      sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const orders = await Order.find(filter)
        .populate('userId', 'name email')
        .sort(sortObj)
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

// Bulk update order status
router.patch(
  '/api/orders/bulk-status',
  requireAuth,
  adminUser,
  [
    body('orderIds')
      .isArray({ min: 1 })
      .withMessage('Danh sách ID đơn hàng không được trống'),
    body('status')
      .isIn(Object.values(OrderStatus))
      .withMessage('Trạng thái đơn hàng không hợp lệ')
  ],
  async (req: Request, res: Response) => {
    try {
      const { orderIds, status } = req.body;

      // Find all orders to check current status
      const orders = await Order.find({ _id: { $in: orderIds } });
      
      if (orders.length !== orderIds.length) {
        return res.status(404).send({ error: 'Một số đơn hàng không tồn tại' });
      }

      // Business logic for status transitions
      const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.Created]: [OrderStatus.Pending, OrderStatus.Cancelled],
        [OrderStatus.Pending]: [OrderStatus.Completed, OrderStatus.Cancelled],
        [OrderStatus.Completed]: [], // Cannot change from complete
        [OrderStatus.Cancelled]: [] // Cannot change from cancelled
      };

      // Check if all orders can transition to new status
      const invalidOrders = orders.filter(order => 
        !allowedTransitions[order.status].includes(status)
      );

      if (invalidOrders.length > 0) {
        return res.status(400).send({ 
          error: `Không thể thay đổi trạng thái cho ${invalidOrders.length} đơn hàng` 
        });
      }

      // Update all orders
      const result = await Order.updateMany(
        { _id: { $in: orderIds } },
        { status }
      );

      res.send({
        message: `Cập nhật trạng thái thành công cho ${result.modifiedCount} đơn hàng`,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      console.error('Error bulk updating order status:', error);
      res.status(500).send({ error: 'Lỗi khi cập nhật hàng loạt trạng thái đơn hàng' });
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
