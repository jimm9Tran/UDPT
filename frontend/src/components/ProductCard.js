import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (product.countInStock <= 0 || product.isReserved) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }
    addItem(product);
    toast.success('Đã thêm vào giỏ hàng');
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Icons.Star
        key={index}
        size={16}
        className={index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
      <Link to={`/products/${product._id || product.id}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.images?.image1 || product.image || '/api/placeholder/300/300'}
            alt={product.title}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Discount Badge */}
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </div>
          )}
          {/* New Badge */}
          {product.isNew && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
              Mới
            </div>
          )}
          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-white font-medium bg-black bg-opacity-50 px-4 py-2 rounded-lg">
              Xem chi tiết
            </span>
          </div>
        </div>
      </Link>
      
      <div className="p-5">
        <Link to={`/products/${product._id || product.id}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-3 hover:text-primary-600 transition-colors line-clamp-2 group-hover:text-primary-600">
            {product.title}
          </h3>
        </Link>
        
        {/* Brand and Category */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
            {product.brand}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
            {product.category}
          </span>
        </div>
        
        {/* Key specs for electronics */}
        {product.specifications && (
          <div className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg">
            {product.specifications.processor && (
              <div className="font-medium">{product.specifications.processor}</div>
            )}
            {product.specifications.ram && product.specifications.storage && (
              <div className="text-xs mt-1">{product.specifications.ram} • {product.specifications.storage}</div>
            )}
          </div>
        )}
        
        <div className="flex items-center mb-3">
          <div className="flex items-center mr-2">
            {renderStars(Math.floor(product.rating || 0))}
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {product.rating || 0} ({product.numReviews || 0})
          </span>
        </div>
        
        <div className="flex items-end justify-between">
          <div className="flex-1">
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-sm text-gray-500 line-through mb-1">
                {product.originalPrice?.toLocaleString('vi-VN')}đ
              </p>
            )}
            <p className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              {product.price?.toLocaleString('vi-VN')}đ
            </p>
            
            {/* Enhanced Stock Status */}
            <div className="mt-2">
              {product.countInStock > 0 && !product.isReserved ? (
                <span className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-semibold ${
                  product.countInStock <= 5 
                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800' 
                    : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    product.countInStock <= 5 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  {product.countInStock <= 5 
                    ? `Chỉ còn ${product.countInStock}` 
                    : `Còn ${product.countInStock}`}
                </span>
              ) : (
                <span className="inline-flex items-center text-xs px-3 py-1 rounded-full font-semibold bg-gradient-to-r from-red-100 to-red-200 text-red-800">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  {product.isReserved ? 'Đã đặt trước' : 'Hết hàng'}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.countInStock <= 0 || product.isReserved}
            className={`ml-3 p-3 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              product.countInStock <= 0 || product.isReserved
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl'
            }`}
            title={
              product.countInStock <= 0 || product.isReserved 
                ? 'Sản phẩm không có sẵn' 
                : 'Thêm vào giỏ hàng'
            }
          >
            <Icons.ShoppingCart size={20} className={product.countInStock > 0 && !product.isReserved ? 'drop-shadow-sm' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
