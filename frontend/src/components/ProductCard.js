import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (product.countInStock <= 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }
    addItem(product);
    toast.success('Đã thêm vào giỏ hàng');
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/products/${product._id || product.id}`}>
        <div className="aspect-w-1 aspect-h-1">
          <img
            src={product.image || '/api/placeholder/300/300'}
            alt={product.title}
            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/products/${product._id || product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors line-clamp-2">
            {product.title}
          </h3>
        </Link>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center mr-2">
            {renderStars(Math.floor(product.rating || 0))}
          </div>
          <span className="text-sm text-gray-600">
            ({product.numReviews || 0} đánh giá)
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-primary-600">
              {product.price?.toLocaleString('vi-VN')}đ
            </p>
            <p className="text-sm text-gray-500">
              Còn lại: {product.countInStock || 0}
            </p>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.countInStock <= 0}
            className={`p-2 rounded-lg transition-colors ${
              product.countInStock <= 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
