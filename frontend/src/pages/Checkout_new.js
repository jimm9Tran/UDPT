import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI, paymentAPI } from '../services/api';
import { toast } from 'react-toastify';
import * as Icons from 'lucide-react';

const Checkout = () => {
  const { 
    items, 
    getTotalPrice, 
    clearCart, 
    validateCart, 
    commitReservation, 
    reservationId 
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [validatingCart, setValidatingCart] = useState(false);
  const [inventoryIssues, setInventoryIssues] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    phone: '',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('vnpay');

  // Validate cart when component mounts using the validateCart function
  const validateCartBeforeCheckout = useCallback(async () => {
    setValidatingCart(true);
    try {
      const validationResult = await validateCart();
      
      if (!validationResult.valid) {
        setInventoryIssues(validationResult.issues || []);
        toast.error(validationResult.message || 'Có vấn đề với giỏ hàng của bạn');
        return false;
      } else {
        setInventoryIssues([]);
        return true;
      }
    } catch (error) {
      console.error('Error validating cart:', error);
      toast.error('Không thể xác nhận giỏ hàng');
      return false;
    } finally {
      setValidatingCart(false);
    }
  }, [validateCart]);

  // Validate cart when component mounts
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    } else {
      validateCartBeforeCheckout();
    }
  }, [items, navigate, validateCartBeforeCheckout]);

  const handleInputChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.phone) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    // Validate cart one more time before submitting
    const cartIsValid = await validateCartBeforeCheckout();
    if (!cartIsValid) {
      toast.error('❌ Có vấn đề với tồn kho. Vui lòng kiểm tra lại giỏ hàng.');
      return;
    }

    if (!reservationId) {
      toast.error('❌ Không thể đặt hàng do không có xác nhận tồn kho.');
      return;
    }

    setLoading(true);

    try {
      // Create order with the reservation ID
      const orderData = {
        cart: items.map(item => ({
          productId: item.id,
          qty: item.quantity,
          price: item.price
        })),
        shippingAddress: shippingInfo,
        paymentMethod,
        reservationId
      };

      const orderResponse = await orderAPI.create(orderData);
      const order = orderResponse.data;

      if (paymentMethod === 'vnpay') {
        // Create payment through unified payment API
        const paymentData = {
          amount: getTotalPrice(),
          orderInfo: `Thanh toán đơn hàng ${order.id}`,
          returnUrl: `${window.location.origin}/orders/${order.id}`
        };

        const paymentResponse = await paymentAPI.processPayment(order.id, 'vnpay', paymentData);
        
        if (paymentResponse.data.paymentUrl) {
          // Commit inventory after successful payment processing
          await commitReservation();
          // Redirect to VNPay
          window.location.href = paymentResponse.data.paymentUrl;
        } else {
          toast.error('Không thể tạo liên kết thanh toán');
        }
      } else if (paymentMethod === 'cod') {
        // Create COD payment
        const paymentData = {
          amount: getTotalPrice()
        };

        await paymentAPI.processPayment(order.id, 'cod', paymentData);
        
        // Commit the inventory reservation
        await commitReservation();
        
        clearCart();
        toast.success('Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.');
        navigate(`/orders/${order.id}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      // Handle specific inventory errors
      const errorMessage = error.response?.data?.message || error.message;
      
      if (errorMessage.includes('chỉ còn') || errorMessage.includes('hết hàng') || errorMessage.includes('đã được đặt trước')) {
        toast.error(`❌ ${errorMessage}`);
        // Suggest refreshing the cart
        toast.info('💡 Vui lòng cập nhật giỏ hàng và thử lại');
      } else {
        toast.error(errorMessage || 'Có lỗi xảy ra khi đặt hàng');
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Thanh toán
          </h1>
          <p className="text-gray-600 mt-1">Hoàn tất thông tin đặt hàng của bạn</p>
        </div>

        {/* Inventory Warnings */}
        {inventoryIssues.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center mb-3">
              <Icons.AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-red-800">
                Không thể đặt hàng - Vấn đề tồn kho
              </h3>
            </div>
            <div className="space-y-2">
              {inventoryIssues.map((issue, index) => (
                <div key={index} className="text-sm text-red-700 bg-red-100 p-3 rounded-lg">
                  • {issue.message}
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-red-700 font-medium">
              Vui lòng quay lại giỏ hàng để điều chỉnh số lượng sản phẩm.
            </div>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Thông tin khách hàng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      disabled
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Thông tin giao hàng
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-gray-50 focus:bg-white"
                      placeholder="Số nhà, tên đường..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thành phố <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-gray-50 focus:bg-white"
                        placeholder="Thành phố/Tỉnh"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-gray-50 focus:bg-white"
                        placeholder="Số điện thoại"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      name="notes"
                      value={shippingInfo.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-gray-50 focus:bg-white"
                      placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Phương thức thanh toán
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="vnpay"
                      checked={paymentMethod === 'vnpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-600 focus:ring-primary-500 h-5 w-5"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-semibold text-gray-900">VNPay</div>
                      <div className="text-sm text-gray-600">
                        Thanh toán qua VNPay (ATM, Internet Banking, VISA, MasterCard)
                      </div>
                    </div>
                    <img src="/vnpay-logo.png" alt="VNPay" className="h-8" />
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-600 focus:ring-primary-500 h-5 w-5"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-semibold text-gray-900">Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-sm text-gray-600">
                        Thanh toán bằng tiền mặt khi nhận hàng
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || validatingCart || inventoryIssues.length > 0}
                className={`w-full flex justify-center items-center py-4 px-6 rounded-xl shadow-lg text-lg font-semibold text-white transition-all duration-200 ${
                  loading || validatingCart || inventoryIssues.length > 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Đang xử lý...
                  </>
                ) : validatingCart ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Đang kiểm tra tồn kho...
                  </>
                ) : inventoryIssues.length > 0 ? (
                  'Không thể đặt hàng'
                ) : (
                  'Đặt hàng ngay'
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Đơn hàng của bạn
              </h2>
              
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.image || '/api/placeholder/80/80'}
                        alt={item.title}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="font-medium text-gray-900 line-clamp-1">{item.title}</div>
                      <div className="mt-1 text-sm text-gray-500">{item.quantity} x {item.price.toLocaleString('vi-VN')}đ</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary-600">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium">
                    {getTotalPrice().toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-primary-600">
                    {getTotalPrice().toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    Đặt hàng đồng nghĩa với việc bạn đồng ý tuân thủ các
                    <button 
                      onClick={() => window.open('/terms-of-service', '_blank')}
                      className="text-primary-600 hover:text-primary-500 ml-1 underline bg-transparent border-none cursor-pointer"
                    >
                      Điều khoản dịch vụ
                    </button>
                    .
                  </p>
                  <p>
                    Đơn hàng của bạn sẽ được xử lý và giao hàng trong vòng 3-5 ngày làm việc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
