import React, { useState, useEffect, useMemo } from 'react';
import { orderAPI, productAPI, paymentAPI, healthAPI } from '../services/api';
import * as Icons from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    orderCounts: {
      pending: 0,
      processing: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0
    },
    recentSales: []
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthStatuses, setHealthStatuses] = useState({});
  const [timeRange, setTimeRange] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all orders
      const ordersResponse = await orderAPI.getAllOrders();
      const allOrders = ordersResponse.data;
      setOrders(allOrders.slice(0, 10));

      // Fetch all products
      const productsResponse = await productAPI.getAll();
      const allProducts = productsResponse.data;

      // Filter orders by time range
      let filteredOrders = allOrders;
      const now = new Date();
      
      if (timeRange === 'today') {
        filteredOrders = allOrders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0);
        });
      } else if (timeRange === 'week') {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredOrders = allOrders.filter(order => new Date(order.createdAt) >= oneWeekAgo);
      } else if (timeRange === 'month') {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filteredOrders = allOrders.filter(order => new Date(order.createdAt) >= oneMonthAgo);
      }

      // Calculate stats
      const totalRevenue = filteredOrders
        .filter(order => order.status === 'completed' || order.status === 'delivered')
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

      const orderCounts = {
        pending: filteredOrders.filter(order => order.status === 'pending').length,
        processing: filteredOrders.filter(order => order.status === 'processing').length,
        delivered: filteredOrders.filter(order => order.status === 'delivered').length,
        completed: filteredOrders.filter(order => order.status === 'completed').length,
        cancelled: filteredOrders.filter(order => order.status === 'cancelled').length
      };

      const salesByDay = {};
      filteredOrders
        .filter(order => order.status === 'completed' || order.status === 'delivered')
        .forEach(order => {
          const date = new Date(order.createdAt).toLocaleDateString('vi-VN');
          if (!salesByDay[date]) {
            salesByDay[date] = 0;
          }
          salesByDay[date] += order.totalPrice || 0;
        });

      const recentSales = Object.entries(salesByDay).map(([date, amount]) => ({
        date,
        amount
      }));

      setStats({
        totalOrders: filteredOrders.length,
        totalProducts: allProducts.length,
        totalRevenue,
        orderCounts,
        recentSales
      });

      // Fetch health statuses
      try {
        const healthResponse = await healthAPI.checkServices();
        setHealthStatuses(healthResponse.data.services);
      } catch (error) {
        console.error('Error fetching health statuses:', error);
        setHealthStatuses({
          user: { status: 'unknown', url: 'http://localhost:3000' },
          product: { status: 'unknown', url: 'http://localhost:3001' },
          order: { status: 'unknown', url: 'http://localhost:3002' },
          payment: { status: 'unknown', url: 'http://localhost:3003' }
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const refreshData = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
      case 'delivered':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Đang xử lý';
      case 'completed':
        return 'Hoàn thành';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      case 'paid':
        return 'Đã thanh toán';
      default:
        return status;
    }
  };

  const getHealthText = (status) => status === 'healthy' ? '✓ Đang hoạt động' : '✗ Ngưng hoạt động';
  const getHealthColor = (status) => status === 'healthy' ? 'text-green-600' : 'text-red-600';

  const getServiceUptimePercent = () => {
    if (!healthStatuses || Object.keys(healthStatuses).length === 0) return 0;
    
    const healthyServices = Object.values(healthStatuses).filter(
      service => service.status === 'healthy'
    ).length;
    
    return Math.round((healthyServices / Object.keys(healthStatuses).length) * 100);
  };

  const uptimePercent = useMemo(getServiceUptimePercent, [healthStatuses]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Bảng điều khiển quản trị
            </h1>
            <p className="text-gray-600 mt-2">
              Tổng quan về hệ thống bán hàng microservices
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
            </select>
            
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Icons.RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Icons.Activity className="w-5 h-5 mr-2 text-primary-600" />
                Trạng thái hệ thống
              </h2>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${uptimePercent >= 75 ? 'bg-green-500' : uptimePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  Uptime: {uptimePercent}%
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(healthStatuses).map(([serviceName, serviceInfo]) => (
                <div key={serviceName} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icons.Server className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900 capitalize">
                        {serviceName}
                      </span>
                    </div>
                    <div className={`text-sm font-medium ${getHealthColor(serviceInfo.status)}`}>
                      {serviceInfo.status === 'healthy' ? (
                        <Icons.CheckCircle className="w-4 h-4" />
                      ) : (
                        <Icons.XCircle className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className={`text-xs ${getHealthColor(serviceInfo.status)}`}>
                      {getHealthText(serviceInfo.status)}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {serviceInfo.url}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
                <Icons.ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-green-600">
                <Icons.Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600">
                <Icons.DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalRevenue.toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600">
                <Icons.Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đơn chờ xử lý</p>
                <p className="text-2xl font-bold text-gray-900">{stats.orderCounts.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Icons.BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
              Phân tích trạng thái đơn hàng
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(stats.orderCounts).map(([status, count]) => (
                <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600 mt-1">{getStatusText(status)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
              <span className="flex items-center">
                <Icons.Eye className="w-5 h-5 mr-2 text-primary-600" />
                Đơn hàng gần đây
              </span>
              <Link
                to="/admin/orders"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Xem tất cả
              </Link>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.user?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.totalPrice?.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
