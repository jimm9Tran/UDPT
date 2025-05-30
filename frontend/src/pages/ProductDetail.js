import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { productAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
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

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.countInStock <= 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }

    if (quantity > product.countInStock) {
      toast.error(`Chỉ còn ${product.countInStock} sản phẩm trong kho`);
      return;
    }

    addItem(product, quantity);
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
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
            src={product.image || '/api/placeholder/600/600'}
            alt={product.title}
            className="w-full h-96 lg:h-full object-cover rounded-lg"
          />
        </div>

        {/* Product Info */}
        <div className="mt-8 lg:mt-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.title}
          </h1>

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
            <p className="text-3xl font-bold text-primary-600">
              {product.price?.toLocaleString('vi-VN')}đ
            </p>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.countInStock > 0 ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Còn hàng ({product.countInStock} sản phẩm)
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Hết hàng
              </span>
            )}
          </div>

          {/* Additional Info */}
          {(product.colors || product.sizes) && (
            <div className="mb-6 space-y-2">
              {product.colors && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Màu sắc:</span> {product.colors}
                </p>
              )}
              {product.sizes && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Kích thước:</span> {product.sizes}
                </p>
              )}
            </div>
          )}

          {/* Quantity & Add to Cart */}
          {product.countInStock > 0 && (
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Số lượng:
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {[...Array(Math.min(product.countInStock, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <ShoppingCart size={20} />
                <span>Thêm vào giỏ hàng</span>
              </button>
            </div>
          )}

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
