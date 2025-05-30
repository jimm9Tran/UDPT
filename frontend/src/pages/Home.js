import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [bestsellers, setBestsellers] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch bestsellers
        const bestsellerResponse = await productAPI.getBestsellers();
        setBestsellers(bestsellerResponse.data.slice(0, 4));
        
        // Fetch featured products (latest products)
        const productsResponse = await productAPI.getAll();
        setFeaturedProducts(productsResponse.data.slice(0, 8));
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Chào mừng đến E-Shop
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Khám phá hàng ngàn sản phẩm chất lượng với giá tốt nhất. 
              Hệ thống microservices hiện đại cho trải nghiệm mua sắm tuyệt vời.
            </p>
            <Link
              to="/products"
              className="inline-block bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Khám phá ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Giao hàng nhanh</h3>
              <p className="text-gray-600">Giao hàng miễn phí cho đơn hàng trên 500.000đ</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 text-2xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Thanh toán đa dạng</h3>
              <p className="text-gray-600">Hỗ trợ VNPay và thanh toán khi nhận hàng</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Bảo mật tuyệt đối</h3>
              <p className="text-gray-600">Hệ thống microservices bảo mật cao</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      {bestsellers.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Sản phẩm bán chạy
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Những sản phẩm được yêu thích nhất bởi khách hàng
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestsellers.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link
                to="/products"
                className="inline-block bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Xem tất cả sản phẩm
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Sản phẩm nổi bật
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Khám phá các sản phẩm mới nhất và chất lượng nhất
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
