import React, { useState, useEffect, useMemo } from 'react';
import { orderAPI, productAPI, paymentAPI, healthAPI } from '../services/api';
import { 
  BarChart3, Package, Users, DollarSign, TrendingUp, Clock, CheckCircle, 
  XCircle, ShoppingBag, RefreshCw, Activity, AlertTriangle, Server,
  Eye, TrendingDown, Calendar, Filter
} from 'lucide-react';
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
  const [timeRange, setTimeRange] = useState('all'); // 'today', 'week', 'month', 'all'
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
      setOrders(allOrders.slice(0, 10)); // Show latest 10 orders

      // Fetch all products
      const productsResponse = await productAPI.getAll();
      const allProducts = productsResponse.data;

      // Filter orders by time range if needed
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

      // Count orders by status
      const orderCounts = {
        pending: filteredOrders.filter(order => order.status === 'pending').length,
        processing: filteredOrders.filter(order => order.status === 'processing').length,
        delivered: filteredOrders.filter(order => order.status === 'delivered').length,
        completed: filteredOrders.filter(order => order.status === 'completed').length,
        cancelled: filteredOrders.filter(order => order.status === 'cancelled').length
      };

      // Group sales by day for chart
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

      // Convert to array for chart
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
        console.log('Fetching health statuses...');
        const healthResponse = await healthAPI.checkServices();
        console.log('Health response:', healthResponse);
        setHealthStatuses(healthResponse.data.services);
      } catch (error) {
        console.error('Error fetching health statuses:', error);
        // Set default statuses if health check fails
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

  // Health status helpers
  const getHealthText = (status) => status === 'healthy' ? '✓ Đang hoạt động' : '✗ Ngưng hoạt động';
  const getHealthColor = (status) => status === 'healthy' ? 'text-green-600' : 'text-red-600';

  // Generate service uptime percentage
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
            {/* Time Range Filter */}
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
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary-600" />
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
                      <Server className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900 capitalize">
                        {serviceName}
                      </span>
                    </div>
                    <div className={`text-sm font-medium ${getHealthColor(serviceInfo.status)}`}>
                      {serviceInfo.status === 'healthy' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
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
          </p>
        </div>
        <div className="flex space-x-4 items-center">
          <div className="flex items-center space-x-2 bg-white rounded-lg shadow px-4 py-2">
            <span className="text-sm text-gray-600">Hiển thị:</span>
            <select 
              className="form-select text-sm border-gray-300 rounded-md focus:border-primary-500 focus:ring focus:ring-primary-200"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
            </select>
          </div>
          <button 
            onClick={refreshData}
            className="flex items-center space-x-2 bg-white rounded-lg shadow px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin text-primary-600" : "text-gray-500"} />
            <span className="text-sm font-medium">Làm mới</span>
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Package className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
          {/* Visual indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <BarChart3 className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
          {/* Visual indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600"></div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đơn chờ xử lý</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.orderCounts.pending}</p>
            </div>
          </div>
          {/* Visual indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-600"></div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <DollarSign className="text-purple-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Doanh thu</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalRevenue.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
          {/* Visual indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600"></div>
        </div>
      </div>

      {/* Order Status & Microservice Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Order Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tình trạng đơn hàng</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-500" size={24} />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Hoàn thành</p>
                <p className="text-xl font-semibold">{stats.orderCounts.completed + stats.orderCounts.delivered}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
              <Clock className="text-yellow-500" size={24} />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Đang xử lý</p>
                <p className="text-xl font-semibold">{stats.orderCounts.pending + stats.orderCounts.processing}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-red-50 rounded-lg">
              <XCircle className="text-red-500" size={24} />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Đã hủy</p>
                <p className="text-xl font-semibold">{stats.orderCounts.cancelled}</p>
              </div>
            </div>
          </div>
          
          {/* Order Status Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Tổng đơn hàng: {stats.totalOrders}</span>
              <span>{stats.totalOrders > 0 ? '100%' : '0%'}</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              {stats.totalOrders > 0 && (
                <>
                  <div 
                    className="h-full bg-green-500 float-left" 
                    style={{ width: `${(stats.orderCounts.completed + stats.orderCounts.delivered) / stats.totalOrders * 100}%` }}
                  ></div>
                  <div 
                    className="h-full bg-yellow-500 float-left" 
                    style={{ width: `${(stats.orderCounts.pending + stats.orderCounts.processing) / stats.totalOrders * 100}%` }}
                  ></div>
                  <div 
                    className="h-full bg-red-500 float-left" 
                    style={{ width: `${stats.orderCounts.cancelled / stats.totalOrders * 100}%` }}
                  ></div>
                </>
              )}
            </div>
            <div className="flex text-xs mt-2 text-gray-600 space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span>Hoàn thành</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                <span>Đang xử lý</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                <span>Đã hủy</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Microservice Health */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Trạng thái microservices</h2>
          
          {/* Uptime Percentage */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-600">Tỉ lệ hoạt động</p>
              <p className="text-3xl font-bold text-gray-900">{uptimePercent}%</p>
            </div>
            <div className="w-24 h-24 rounded-full flex items-center justify-center border-8" style={{
              borderColor: uptimePercent > 80 ? '#10B981' : uptimePercent > 50 ? '#F59E0B' : '#EF4444',
              borderRightColor: 'transparent'
            }}>
              <span className="text-lg font-bold">{uptimePercent}%</span>
            </div>
          </div>
          
          {/* Service Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(healthStatuses).map(([serviceName, serviceInfo]) => (
              <div 
                key={serviceName} 
                className={`p-3 rounded-lg border-l-4 ${
                  serviceInfo.status === 'healthy' ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium capitalize">{serviceName}</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    serviceInfo.status === 'healthy' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {serviceInfo.status === 'healthy' ? '✓ Hoạt động' : '✗ Lỗi'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {serviceInfo.url}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Đơn hàng gần đây
          </h2>
          <Link to="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Xem tất cả
          </Link>
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
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phương thức
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id || order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link to={`/admin/orders/${order.id || order._id}`} className="text-primary-600 hover:text-primary-800">
                      #{(order.id || order._id)?.slice(-8)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.user?.name || order.user?.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.totalPrice?.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.paymentMethod === 'vnpay' ? 'VNPay' : 'COD'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Chưa có đơn hàng nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
