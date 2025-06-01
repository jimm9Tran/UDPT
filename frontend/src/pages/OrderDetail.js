import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI, paymentAPI } from '../services/api';
import * as Icons from 'lucide-react';
import { toast } from 'react-toastify';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderEvents, setOrderEvents] = useState([]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch order details
        const orderResponse = await orderAPI.getById(id);
        setOrder(orderResponse.data);

        // Try to fetch payment details
        try {
          const paymentResponse = await paymentAPI.getPayment(id);
          setPayment(paymentResponse.data);
        } catch (paymentError) {
          // Payment might not exist yet, that's okay
          console.log('Payment not found or not yet created');
        }
        
        // Fetch order events history
        try {
          const eventsResponse = await orderAPI.getOrderEvents(id);
          setOrderEvents(eventsResponse.data.events || []);
        } catch (eventsError) {
          console.log('Order events not available', eventsError);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Icons.Clock className="text-yellow-500" size={24} />;
      case 'processing':
        return <Icons.Package className="text-blue-500" size={24} />;
      case 'shipped':
        return <Icons.Truck className="text-indigo-500" size={24} />;
      case 'completed':
      case 'delivered':
        return <Icons.CheckCircle className="text-green-500" size={24} />;
      case 'cancelled':
        return <Icons.XCircle className="text-red-500" size={24} />;
      case 'failed':
        return <Icons.AlertTriangle className="text-red-500" size={24} />;
      default:
        return <Icons.Package className="text-gray-500" size={24} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Đang xử lý';
      case 'processing':
        return 'Đang chuẩn bị';
      case 'shipped':
        return 'Đang vận chuyển';
      case 'completed':
        return 'Hoàn thành';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      case 'paid':
        return 'Đã thanh toán';
      case 'failed':
        return 'Thất bại';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'completed':
      case 'delivered':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'ORDER_CREATED':
        return <Icons.Package className="text-blue-500" />;
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_COMPLETED':
        return <Icons.CreditCard className="text-green-500" />;
      case 'PAYMENT_FAILED':
        return <Icons.AlertTriangle className="text-red-500" />;
      case 'ORDER_PROCESSING':
        return <Icons.Activity className="text-purple-500" />;
      case 'ORDER_SHIPPED':
        return <Icons.Truck className="text-indigo-500" />;
      case 'ORDER_DELIVERED':
        return <Icons.CheckCircle className="text-green-500" />;
      case 'ORDER_CANCELLED':
        return <Icons.XCircle className="text-red-500" />;
      default:
        return <Icons.Calendar className="text-gray-500" />;
    }
  };

  const getEventTitle = (type) => {
    switch (type) {
      case 'ORDER_CREATED':
        return 'Đơn hàng được tạo';
      case 'PAYMENT_RECEIVED':
        return 'Đã nhận thanh toán';
      case 'PAYMENT_COMPLETED':
        return 'Thanh toán hoàn tất';
      case 'PAYMENT_FAILED':
        return 'Thanh toán thất bại';
      case 'ORDER_PROCESSING':
        return 'Đang xử lý đơn hàng';
      case 'ORDER_SHIPPED':
        return 'Đơn hàng đã được gửi đi';
      case 'ORDER_DELIVERED':
        return 'Đơn hàng đã được giao';
      case 'ORDER_CANCELLED':
        return 'Đơn hàng đã bị hủy';
      default:
        return type.replace(/_/g, ' ').toLowerCase();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-gray-600 mb-6">
            Đơn hàng bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.
          </p>
          <Link
            to="/orders"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(order.status)}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Đơn hàng #{order.id?.slice(-8) || order._id?.slice(-8)}
              </h1>
              <p className="text-gray-600">
                Đặt ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sản phẩm đã đặt
            </h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                  <img
                    src={item.image || '/api/placeholder/80/80'}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    <p className="text-sm font-medium text-primary-600">
                      {item.price?.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {(item.price * item.quantity)?.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Thông tin giao hàng
            </h2>
            <div className="space-y-3">
              {order.shippingAddress && (
                <>
                  <div className="flex items-start space-x-2">
                    <Icons.User className="text-gray-400 mt-1" size={16} />
                    <div>
                      <p className="font-medium">{order.user?.name || 'Khách hàng'}</p>
                      <p className="text-sm text-gray-600">{order.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Icons.MapPin className="text-gray-400 mt-1" size={16} />
                    <div>
                      <p className="text-gray-900">
                        {order.shippingAddress.address}, {order.shippingAddress.city}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icons.Phone className="text-gray-400" size={16} />
                    <p className="text-gray-900">{order.shippingAddress.phone}</p>
                  </div>
                  {order.shippingAddress.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Ghi chú:</span> {order.shippingAddress.notes}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary & Payment */}
        <div className="space-y-6">
          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Thông tin thanh toán
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức:</span>
                <span className="font-medium">
                  {order.paymentMethod === 'vnpay' ? 'VNPay' : 'COD'}
                </span>
              </div>
              {payment && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trạng thái thanh toán:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                    {payment.status === 'completed' ? 'Đã thanh toán' : 
                     payment.status === 'pending' ? 'Chờ thanh toán' : 
                     payment.status === 'failed' ? 'Thanh toán thất bại' : payment.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Tóm tắt đơn hàng
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">
                  {order.totalPrice?.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium text-green-600">Miễn phí</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-semibold">
                <span>Tổng cộng:</span>
                <span className="text-primary-600">
                  {order.totalPrice?.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/orders"
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors text-center block font-medium"
            >
              Quay lại danh sách đơn hàng
            </Link>
            {order.status === 'pending' && order.paymentMethod === 'cod' && (
              <button
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                onClick={() => {
                  // Add cancel order functionality here
                  toast.info('Chức năng hủy đơn hàng đang được phát triển');
                }}
              >
                Hủy đơn hàng
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Lịch sử đơn hàng
        </h2>
        
        {orderEvents && orderEvents.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {/* Timeline events */}
            <div className="space-y-8 relative pl-12">
              {orderEvents.map((event, index) => (
                <div key={index} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute left-[-2.5rem] p-2 rounded-full bg-white shadow-md border border-gray-100">
                    {getEventIcon(event.type)}
                  </div>
                  
                  {/* Event content */}
                  <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-900">
                      {getEventTitle(event.type)}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(event.timestamp).toLocaleString('vi-VN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {event.data && (
                      <div className="mt-2 text-sm">
                        {typeof event.data === 'object' 
                          ? Object.entries(event.data).map(([key, value]) => (
                              <div key={key} className="flex justify-between py-1 border-b border-dashed border-gray-100 last:border-0">
                                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                                <span className="font-medium">{String(value)}</span>
                              </div>
                            ))
                          : <p className="text-gray-600">{String(event.data)}</p>
                        }
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Icons.Activity size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Không có dữ liệu lịch sử đơn hàng</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
