import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI, paymentAPI } from '../services/api';
import { toast } from 'react-toastify';

const Checkout = () => {
  const { items, getTotalPrice, clearCart, validateCart, commitReservation, reservationId } = useCart();
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

  // Validate cart when component mounts using the new validateCart function
  const validateCartBeforeCheckout = async () => {
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
  };

  // Check inventory when component mounts
  useEffect(() => {
    checkInventoryBeforeOrder();
  }, [items]);

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

    // Check inventory one more time before submitting
    const inventoryValid = await checkInventoryBeforeOrder();
    if (!inventoryValid) {
      toast.error('❌ Có vấn đề với tồn kho. Vui lòng kiểm tra lại giỏ hàng.');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderData = {
        cart: items.map(item => ({
          productId: item.id,
          qty: item.quantity,
          price: item.price
        })),
        shippingAddress: shippingInfo,
        paymentMethod
      };

      const orderResponse = await orderAPI.create(orderData);
      const order = orderResponse.data;

      if (paymentMethod === 'vnpay') {
        // Create VNPay payment
        const paymentData = {
          orderId: order.id,
          amount: getTotalPrice(),
          orderInfo: `Thanh toán đơn hàng ${order.id}`
        };

        const paymentResponse = await paymentAPI.createVNPay(paymentData);
        
        if (paymentResponse.data.paymentUrl) {
          // Redirect to VNPay
          window.location.href = paymentResponse.data.paymentUrl;
        } else {
          toast.error('Không thể tạo liên kết thanh toán');
        }
      } else if (paymentMethod === 'cod') {
        // Create COD payment
        const paymentData = {
          orderId: order.id,
          amount: getTotalPrice()
        };

        await paymentAPI.createCOD(paymentData);
        
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

      {/* Inventory Warnings */}
      {inventoryIssues.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-sm font-medium text-red-800">
              Không thể đặt hàng - Vấn đề tồn kho
            </h3>
          </div>
          <div className="space-y-1">
            {inventoryIssues.map((issue, index) => (
              <div key={index} className="text-sm text-red-700">
                • {issue.message}
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm text-red-700">
            Vui lòng quay lại giỏ hàng để điều chỉnh số lượng sản phẩm.
          </div>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Thông tin khách hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="input-field bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-field bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Thông tin giao hàng
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Số nhà, tên đường..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thành phố *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Thành phố/Tỉnh"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Số điện thoại"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    name="notes"
                    value={shippingInfo.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="input-field"
                    placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vnpay"
                    checked={paymentMethod === 'vnpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3">
                    <span className="font-medium">VNPay</span>
                    <span className="text-gray-500 text-sm block">
                      Thanh toán qua VNPay (ATM, Internet Banking, VISA, MasterCard)
                    </span>
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3">
                    <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                    <span className="text-gray-500 text-sm block">
                      Thanh toán bằng tiền mặt khi nhận hàng
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || inventoryChecking || inventoryIssues.length > 0}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                loading || inventoryChecking || inventoryIssues.length > 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              } transition-colors`}
            >
              {loading ? 'Đang xử lý...' : inventoryChecking ? 'Đang kiểm tra tồn kho...' : inventoryIssues.length > 0 ? 'Không thể đặt hàng' : 'Đặt hàng'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Đơn hàng của bạn
            </h2>
            
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.title} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">
                  {getTotalPrice().toLocaleString('vi-VN')}đ
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
                  {getTotalPrice().toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
