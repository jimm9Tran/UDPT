import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { productAPI } from '../services/api';
import * as Icons from 'lucide-react';

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } = useCart();
  const [inventoryWarnings, setInventoryWarnings] = useState([]);
  const [isCheckingInventory, setIsCheckingInventory] = useState(false);

  // Function to check cart inventory
  const checkCartInventory = useCallback(async () => {
    if (items.length === 0) return;
    
    setIsCheckingInventory(true);
    try {
      const cartItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));
      
      const response = await productAPI.checkCartInventory(cartItems);
      
      if (!response.data.isValid) {
        setInventoryWarnings(response.data.issues);
      } else {
        setInventoryWarnings([]);
      }
    } catch (error) {
      console.error('Error checking inventory:', error);
    } finally {
      setIsCheckingInventory(false);
    }
  }, [items]);

  // Check inventory when component mounts and when items change
  useEffect(() => {
    checkCartInventory();
  }, [items, checkCartInventory]);

  // Get warning for specific item
  const getItemWarning = (itemId) => {
    return inventoryWarnings.find(warning => warning.productId === itemId);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icons.ShoppingBag size={40} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Giỏ hàng trống
              </h2>
              <p className="text-gray-600 mb-8">
                Hãy thêm một số sản phẩm vào giỏ hàng để tiếp tục mua sắm
              </p>
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Icons.ArrowLeft className="w-5 h-5 mr-2" />
                Khám phá sản phẩm
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Giỏ hàng của bạn
              </h1>
              <p className="text-gray-600 mt-1">
                {getTotalItems()} sản phẩm trong giỏ hàng
              </p>
            </div>
            <button
              onClick={clearCart}
              className="flex items-center text-red-600 hover:text-red-700 font-medium transition-colors hover:bg-red-50 px-3 py-2 rounded-lg"
            >
              <Icons.Trash2 className="w-4 h-4 mr-2" />
              Xóa tất cả
            </button>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            {inventoryWarnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  <Icons.AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                  <h3 className="text-sm font-medium text-yellow-800">
                    Cảnh báo tồn kho
                  </h3>
                </div>
                <div className="mt-2 text-sm text-yellow-700">
                  Một số sản phẩm trong giỏ hàng có vấn đề về tồn kho. Vui lòng kiểm tra và điều chỉnh số lượng.
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {items.map((item) => {
                const warning = getItemWarning(item.id);
                return (
                  <div key={item.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow ${warning ? 'border-l-4 border-yellow-400' : ''}`}>
                    {warning && (
                      <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center">
                          <Icons.AlertTriangle className="h-4 w-4 text-yellow-400 mr-2" />
                          <span className="text-sm text-yellow-800 font-medium">
                            {warning.message}
                          </span>
                        </div>
                        {warning.availableQuantity > 0 && (
                          <div className="text-xs text-yellow-700 mt-1">
                            Số lượng có sẵn: {warning.availableQuantity}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        <img
                          src={item.image || '/api/placeholder/80/80'}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-primary-600 font-semibold text-lg">
                          {item.price.toLocaleString('vi-VN')}đ
                        </p>
                        {item.brand && (
                          <p className="text-sm text-gray-500 mt-1">
                            Thương hiệu: {item.brand}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <Icons.Minus size={16} />
                        </button>
                        
                        <span className="w-12 text-center font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= (item.countInStock || 0)}
                          className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          title={item.quantity >= (item.countInStock || 0) ? 'Đã đạt giới hạn tồn kho' : 'Tăng số lượng'}
                        >
                          <Icons.Plus size={16} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 mb-2">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa sản phẩm"
                        >
                          <Icons.Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Tóm tắt đơn hàng
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({getTotalItems()} sản phẩm):</span>
                  <span className="font-medium text-gray-900">
                    {getTotalPrice().toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-primary-600">
                      {getTotalPrice().toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {inventoryWarnings.length > 0 ? (
                  <div className="w-full bg-gray-400 text-white py-3 px-4 rounded-xl text-center font-medium cursor-not-allowed flex items-center justify-center">
                    <Icons.Lock className="w-4 h-4 mr-2" />
                    Không thể thanh toán - Vấn đề tồn kho
                  </div>
                ) : (
                  <Link
                    to="/checkout"
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200 text-center block font-semibold transform hover:-translate-y-0.5"
                  >
                    {isCheckingInventory ? 'Đang kiểm tra...' : 'Tiến hành thanh toán'}
                  </Link>
                )}
                <Link
                  to="/products"
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors text-center font-medium flex items-center justify-center"
                >
                  <Icons.ArrowLeft className="w-4 h-4 mr-2" />
                  Tiếp tục mua sắm
                </Link>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <Icons.Lock className="w-4 h-4 mr-2" />
                  Thanh toán an toàn và bảo mật
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
