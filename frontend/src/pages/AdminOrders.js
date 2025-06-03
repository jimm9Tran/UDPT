import React, { useState, useEffect, useCallback } from 'react';
import { orderAPI, paymentAPI } from '../services/api';
import * as Icons from 'lucide-react';
import { toast } from 'react-toastify';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderPayments, setOrderPayments] = useState({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, dateRange, sortBy, sortOrder, pagination.page]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy,
        sortOrder,
        search: searchTerm || undefined,
        dateRange: dateRange !== 'all' ? dateRange : undefined
      };

      // Filter out undefined values
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined)
      );

      const response = await orderAPI.getAllOrders(filteredParams);
      setOrders(response.data.orders || response.data);
      
      if (response.data.pagination) {
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      }

      // Fetch payment information for each order
      const paymentPromises = (response.data.orders || response.data).map(async (order) => {
        try {
          const paymentResponse = await paymentAPI.getPayment(order.id || order._id);
          return { orderId: order.id || order._id, payment: paymentResponse.data };
        } catch (error) {
          return { orderId: order.id || order._id, payment: null };
        }
      });

      const paymentResults = await Promise.all(paymentPromises);
      const paymentsMap = paymentResults.reduce((acc, { orderId, payment }) => {
        acc[orderId] = payment;
        return acc;
      }, {});
      
      setOrderPayments(paymentsMap);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateRange, sortBy, sortOrder, pagination.page, pagination.limit, searchTerm]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      if (newStatus === 'delivered') {
        await orderAPI.deliver(orderId);
      } else if (newStatus === 'cancelled') {
        await orderAPI.cancel(orderId);
      } else {
        await orderAPI.updateStatus(orderId, newStatus);
      }
      toast.success('Cập nhật trạng thái đơn hàng thành công!');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Lỗi khi cập nhật trạng thái đơn hàng');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedOrders.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một đơn hàng');
      return;
    }

    const statusMapping = {
      'delivered': 'completed',
      'cancelled': 'cancelled',
      'processing': 'pending'
    };

    const confirmMessage = {
      'delivered': 'Bạn có chắc chắn muốn đánh dấu đã giao cho các đơn hàng đã chọn?',
      'cancelled': 'Bạn có chắc chắn muốn hủy các đơn hàng đã chọn?',
      'processing': 'Bạn có chắc chắn muốn chuyển các đơn hàng đã chọn sang trạng thái đang xử lý?'
    };

    if (!window.confirm(confirmMessage[action])) return;

    try {
      setLoading(true);
      const status = statusMapping[action];
      await orderAPI.bulkUpdateStatus(selectedOrders, status);
      setSelectedOrders([]);
      toast.success(`Đã cập nhật ${selectedOrders.length} đơn hàng`);
      fetchOrders(); // Refresh the order list
    } catch (error) {
      console.error('Error bulk updating orders:', error);
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra khi cập nhật hàng loạt');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id || order._id));
    }
  };

  const handleOrderDetail = async (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const exportOrders = async (format = 'csv') => {
    try {
      const exportData = filteredOrders.map(order => ({
        'Mã đơn hàng': order.id || order._id,
        'Khách hàng': order.user?.name || 'N/A',
        'Email': order.user?.email || 'N/A',
        'Tổng tiền': order.totalPrice,
        'Trạng thái': getStatusText(order.status),
        'Phương thức thanh toán': order.paymentMethod === 'vnpay' ? 'VNPay' : 'COD',
        'Ngày đặt': new Date(order.createdAt).toLocaleDateString('vi-VN'),
        'Đã thanh toán': order.isPaid ? 'Có' : 'Không',
        'Đã giao': order.isDelivered ? 'Có' : 'Không'
      }));

      if (format === 'csv') {
        const csv = [
          Object.keys(exportData[0]).join(','),
          ...exportData.map(row => Object.values(row).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }

      setShowExportModal(false);
      toast.success('Xuất dữ liệu thành công!');
    } catch (error) {
      toast.error('Lỗi khi xuất dữ liệu');
    }
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.id || order._id)?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const matchesDateRange = (() => {
      if (dateRange === 'all') return true;
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      
      switch (dateRange) {
        case 'today':
          return orderDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return orderDate >= monthAgo;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'totalPrice':
        aValue = a.totalPrice || 0;
        bValue = b.totalPrice || 0;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'customer':
        aValue = a.user?.name || '';
        bValue = b.user?.name || '';
        break;
      default:
        aValue = a[sortBy];
        bValue = b[sortBy];
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <p className="text-gray-600 mt-2">Xem và quản lý tất cả đơn hàng</p>
      </div>

      {/* Enhanced Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Status Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
            <option value="delivered">Đã giao</option>
            <option value="cancelled">Đã hủy</option>
            <option value="paid">Đã thanh toán</option>
          </select>

          {/* Date Range Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all">Tất cả thời gian</option>
            <option value="today">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
          </select>

          {/* Sort By */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdAt">Ngày tạo</option>
            <option value="totalPrice">Tổng tiền</option>
            <option value="status">Trạng thái</option>
            <option value="customer">Khách hàng</option>
          </select>

          {/* Sort Order */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              {sortOrder === 'asc' ? <Icons.ArrowUp size={16} /> : <Icons.ArrowDown size={16} />}
              {sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-blue-800">
              Đã chọn {selectedOrders.length} đơn hàng
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('delivered')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Đánh dấu đã giao
              </button>
              <button
                onClick={() => handleBulkAction('cancelled')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hủy đơn hàng
              </button>
              <button
                onClick={() => setSelectedOrders([])}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Bỏ chọn tất cả
              </button>
            </div>
          </div>
        )}

        {/* Export Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Icons.Download size={16} />
            Xuất dữ liệu
          </button>
        </div>
      </div>

      {/* Orders Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
          <div className="text-sm text-gray-600">Tổng đơn hàng</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Đang xử lý</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === 'delivered').length}
          </div>
          <div className="text-sm text-gray-600">Đã giao</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-red-600">
            {orders.filter(o => o.status === 'cancelled').length}
          </div>
          <div className="text-sm text-gray-600">Đã hủy</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === sortedOrders.length && sortedOrders.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
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
                  Thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phương thức
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedOrders.map((order) => {
                const payment = orderPayments[order.id || order._id];
                return (
                <tr key={order.id || order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id || order._id)}
                      onChange={() => handleSelectOrder(order.id || order._id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{(order.id || order._id)?.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.user?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{order.user?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.totalPrice?.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.isPaid || payment?.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {order.isPaid || payment?.status === 'success' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                      {payment?.paidAt && (
                        <span className="text-xs text-gray-500 mt-1">
                          {new Date(payment.paidAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.paymentMethod === 'vnpay' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.paymentMethod === 'vnpay' ? 'VNPay' : 'COD'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOrderDetail(order)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <Icons.Eye size={16} />
                      </button>
                      
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id || order._id, 'delivered')}
                          className="text-green-600 hover:text-green-900"
                          title="Đánh dấu đã giao"
                        >
                          <Icons.Truck size={16} />
                        </button>
                      )}
                      
                      {(order.status === 'pending' || order.status === 'completed') && (
                        <button
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
                              updateOrderStatus(order.id || order._id, 'cancelled');
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Hủy đơn hàng"
                        >
                          <Icons.X size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        {sortedOrders.length === 0 && (
          <div className="text-center py-12">
            <Icons.Package size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            <Icons.ChevronLeft size={16} />
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-700">
            Trang {pagination.page} / {pagination.pages}
          </span>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            <Icons.ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          payment={orderPayments[selectedOrder.id || selectedOrder._id]}
          onClose={() => setShowOrderDetail(false)}
          onUpdateStatus={updateOrderStatus}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Xuất dữ liệu đơn hàng</h3>
            <p className="text-gray-600 mb-4">
              Sẽ xuất {sortedOrders.length} đơn hàng hiện tại
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => exportOrders('csv')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Xuất CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Order Detail Modal Component
const OrderDetailModal = ({ order, payment, onClose, onUpdateStatus }) => {
  if (!order) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Icons.Clock className="text-yellow-500" size={24} />;
      case 'completed':
        return <Icons.CheckCircle className="text-green-500" size={24} />;
      case 'delivered':
        return <Icons.Truck className="text-green-500" size={24} />;
      case 'cancelled':
        return <Icons.XCircle className="text-red-500" size={24} />;
      default:
        return <Icons.Package className="text-gray-500" size={24} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            {getStatusIcon(order.status)}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Đơn hàng #{(order.id || order._id)?.slice(-8)}
              </h2>
              <p className="text-gray-600">
                Ngày tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Icons.X size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Info */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icons.User size={20} />
                Thông tin khách hàng
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Tên:</span> {order.user?.name || 'N/A'}</p>
                <p><span className="font-medium">Email:</span> {order.user?.email || 'N/A'}</p>
                <p><span className="font-medium">Điện thoại:</span> {order.user?.phone || 'N/A'}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icons.MapPin size={20} />
                Địa chỉ giao hàng
              </h3>
              <div className="space-y-1">
                {order.shippingAddress ? (
                  <>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </>
                ) : (
                  <p className="text-gray-500">Không có thông tin địa chỉ</p>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icons.CreditCard size={20} />
                Thông tin thanh toán
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Phương thức:</span> 
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    order.paymentMethod === 'vnpay' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {order.paymentMethod === 'vnpay' ? 'VNPay' : 'COD'}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Trạng thái:</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    order.isPaid || payment?.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {order.isPaid || payment?.status === 'success' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </p>
                {payment?.paidAt && (
                  <p>
                    <span className="font-medium">Ngày thanh toán:</span> 
                    {new Date(payment.paidAt).toLocaleString('vi-VN')}
                  </p>
                )}
                {payment?.stripeId && (
                  <p>
                    <span className="font-medium">Mã giao dịch:</span> 
                    <code className="text-sm bg-gray-100 px-1 rounded">{payment.stripeId}</code>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Items & Summary */}
          <div className="space-y-6">
            {/* Order Items */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icons.Package size={20} />
                Sản phẩm đặt hàng
              </h3>
              <div className="space-y-3">
                {order.cart?.map((item, index) => (
                  <div key={index} className="flex justify-between items-start bg-white p-3 rounded border">
                    <div className="flex gap-3">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-600">
                          Số lượng: {item.qty || item.quantity}
                        </p>
                        {item.color && (
                          <p className="text-sm text-gray-600">Màu: {item.color}</p>
                        )}
                        {item.size && (
                          <p className="text-sm text-gray-600">Size: {item.size}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.price?.toLocaleString('vi-VN')}đ</p>
                      <p className="text-sm text-gray-600">
                        Tổng: {((item.price || 0) * (item.qty || item.quantity || 1))?.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Tổng kết đơn hàng</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tiền hàng:</span>
                  <span>{order.itemsPrice?.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span>{order.shippingPrice?.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Thuế:</span>
                  <span>{order.taxPrice?.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{order.totalPrice?.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>

            {/* Status Actions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Cập nhật trạng thái</h3>
              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        onUpdateStatus(order.id || order._id, 'delivered');
                        onClose();
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Icons.Truck size={16} />
                      Đánh dấu đã giao
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
                          onUpdateStatus(order.id || order._id, 'cancelled');
                          onClose();
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                      <Icons.X size={16} />
                      Hủy đơn hàng
                    </button>
                  </>
                )}
                {order.status === 'completed' && !order.isDelivered && (
                  <button
                    onClick={() => {
                      onUpdateStatus(order.id || order._id, 'delivered');
                      onClose();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Icons.Truck size={16} />
                    Đánh dấu đã giao
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
