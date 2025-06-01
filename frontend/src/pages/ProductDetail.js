import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { productAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [stockCheckLoading, setStockCheckLoading] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getById(id);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Real-time stock check function
  const checkCurrentStock = async () => {
    if (!product) return;
    
    try {
      setStockCheckLoading(true);
      const response = await productAPI.checkInventory(product._id);
      const stockData = response.data;
      
      // Update product state with current stock info
      setProduct(prev => ({
        ...prev,
        countInStock: stockData.countInStock,
        isReserved: stockData.isReserved
      }));

      if (!stockData.isAvailable) {
        toast.warning('⚠️ Trạng thái sản phẩm đã thay đổi!');
      } else {
        toast.success('✅ Kiểm tra tồn kho thành công');
      }
    } catch (error) {
      console.error('Error checking stock:', error);
      toast.error('Không thể kiểm tra tồn kho');
    } finally {
      setStockCheckLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Check stock before adding to cart
    await checkCurrentStock();
    
    // Re-check after stock update
    if (product.countInStock <= 0 || product.isReserved) {
      toast.error('❌ Sản phẩm đã hết hàng hoặc đã được đặt trước');
      return;
    }

    if (quantity > product.countInStock) {
      toast.error(`❌ Chỉ còn ${product.countInStock} sản phẩm trong kho`);
      return;
    }

    addItem(product, quantity);
    toast.success(`✅ Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Icons.Star
        key={index}
        size={20}
        className={index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Không tìm thấy sản phẩm
          </h2>
          <p className="text-gray-600">
            Sản phẩm bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
        {/* Product Image */}
        <div className="aspect-w-1 aspect-h-1">
          <img
            src={product.images?.image1 || product.image || '/api/placeholder/600/600'}
            alt={product.title}
            className="w-full h-96 lg:h-full object-cover rounded-lg"
          />
        </div>

        {/* Product Info */}
        <div className="mt-8 lg:mt-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.title}
          </h1>

          {/* Brand and Category */}
          <div className="flex items-center space-x-4 mb-4">
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              {product.brand}
            </span>
            <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
              {product.category}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex items-center mr-3">
              {renderStars(Math.floor(product.rating || 0))}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating || 0}/5 ({product.numReviews || 0} đánh giá)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-lg text-gray-500 line-through mb-1">
                {product.originalPrice?.toLocaleString('vi-VN')}đ
              </p>
            )}
            <p className="text-3xl font-bold text-primary-600">
              {product.price?.toLocaleString('vi-VN')}đ
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Specifications */}
          {product.specifications && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông số kỹ thuật</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.specifications.processor && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Bộ xử lý:</span>
                    <span className="font-medium">{product.specifications.processor}</span>
                  </div>
                )}
                {product.specifications.ram && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">RAM:</span>
                    <span className="font-medium">{product.specifications.ram}</span>
                  </div>
                )}
                {product.specifications.storage && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Bộ nhớ:</span>
                    <span className="font-medium">{product.specifications.storage}</span>
                  </div>
                )}
                {product.specifications.display && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Màn hình:</span>
                    <span className="font-medium">{product.specifications.display}</span>
                  </div>
                )}
                {product.specifications.battery && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Pin:</span>
                    <span className="font-medium">{product.specifications.battery}</span>
                  </div>
                )}
                {product.specifications.camera && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Camera:</span>
                    <span className="font-medium">{product.specifications.camera}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tính năng nổi bật</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {product.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {/* In The Box */}
          {product.inTheBox && product.inTheBox.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Trong hộp gồm</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {product.inTheBox.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, idx) => (
                  <span key={idx} className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="flex items-center mb-6">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 bg-gray-200 rounded-l">
              <Icons.Minus size={16} />
            </button>
            <span className="px-4 py-2 border-t border-b border-gray-200">{quantity}</span>
            <button onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))} className="p-2 bg-gray-200 rounded-r">
              <Icons.Plus size={16} />
            </button>
            <button onClick={handleAddToCart} className="ml-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
              <Icons.ShoppingCart className="inline-block mr-2" />
              Thêm vào giỏ
            </button>
          </div>

          {/* Stock Status with Real-time Check */}
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              {product.countInStock > 0 && !product.isReserved ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Còn hàng ({product.countInStock} sản phẩm)
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <Icons.AlertTriangle size={16} className="mr-1" />
                  {product.isReserved ? 'Đã được đặt trước' : 'Hết hàng'}
                </span>
              )}
              
              {/* Real-time Stock Check Button */}
              <button
                onClick={checkCurrentStock}
                disabled={stockCheckLoading}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                title="Kiểm tra tồn kho hiện tại"
              >
                <Icons.RefreshCw 
                  size={14} 
                  className={`mr-1 ${stockCheckLoading ? 'animate-spin' : ''}`} 
                />
                {stockCheckLoading ? 'Đang kiểm tra...' : 'Kiểm tra tồn kho'}
              </button>
            </div>
            
            {/* Stock Warning */}
            {product.countInStock > 0 && product.countInStock <= 5 && !product.isReserved && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center text-yellow-800">
                  <Icons.AlertTriangle size={16} className="mr-2" />
                  <span className="text-sm font-medium">
                    Chỉ còn {product.countInStock} sản phẩm! Hãy nhanh tay đặt hàng.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Seller Info */}
          <div className="border-t pt-6">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Người bán:</span> {product.userId || 'Shop chính thức'}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Đánh giá sản phẩm
        </h2>
        
        <div className="text-center py-8 text-gray-500">
          <p>Chức năng đánh giá đang được phát triển...</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
