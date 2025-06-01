import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import * as Icons from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        {/* Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -top-10 left-1/2 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-6">
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Icons.TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Hệ thống Microservices</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Trải nghiệm mua sắm
                <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  thế hệ mới
                </span>
              </h1>
              
              <p className="text-xl text-primary-100 mb-8 max-w-2xl">
                Khám phá hàng ngàn sản phẩm chất lượng cao với công nghệ microservices hiện đại, 
                mang đến trải nghiệm mua sắm mượt mà và an toàn.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/products"
                  className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl"
                >
                  <Icons.ShoppingBag className="w-5 h-5 mr-2" />
                  Khám phá ngay
                  <Icons.ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                
                <Link
                  to="/about"
                  className="inline-flex items-center px-8 py-4 border-2 border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                >
                  Tìm hiểu thêm
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">1000+</div>
                  <div className="text-sm text-primary-100">Sản phẩm</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">5000+</div>
                  <div className="text-sm text-primary-100">Khách hàng</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="text-sm text-primary-100">Uptime</div>
                </div>
              </div>
            </div>
            
            {/* Hero Image/Animation */}
            <div className="relative">
              <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  {featuredProducts.slice(0, 4).map((product, index) => (
                    <div 
                      key={product._id} 
                      className={`bg-white rounded-2xl p-4 shadow-xl transform hover:scale-105 transition-all duration-300 ${
                        index % 2 === 0 ? 'animate-float' : 'animate-float-delayed'
                      }`}
                    >
                      <img
                        src={product.image || '/api/placeholder/120/120'}
                        alt={product.title}
                        className="w-full h-20 object-cover rounded-lg mb-2"
                      />
                      <div className="text-xs font-medium text-gray-900 truncate">{product.title}</div>
                      <div className="text-sm font-bold text-primary-600">
                        {product.price?.toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn chúng tôi?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hệ thống microservices hiện đại mang đến trải nghiệm mua sắm tuyệt vời
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Icons.Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Bảo mật cao</h3>
              <p className="text-gray-600">
                Hệ thống bảo mật đa lớp với mã hóa end-to-end
              </p>
            </div>
            
            <div className="group text-center p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Icons.Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Giao hàng nhanh</h3>
              <p className="text-gray-600">
                Miễn phí giao hàng toàn quốc cho đơn từ 500.000đ
              </p>
            </div>
            
            <div className="group text-center p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Icons.CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Thanh toán đa dạng</h3>
              <p className="text-gray-600">
                Hỗ trợ nhiều phương thức thanh toán an toàn
              </p>
            </div>
            
            <div className="group text-center p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Icons.Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Chất lượng đảm bảo</h3>
              <p className="text-gray-600">
                Sản phẩm chính hãng với chế độ bảo hành tốt nhất
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      {bestsellers.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Sản phẩm bán chạy
                </h2>
                <p className="text-xl text-gray-600">
                  Những sản phẩm được khách hàng yêu thích nhất
                </p>
              </div>
              <Link
                to="/products"
                className="hidden md:flex items-center text-primary-600 hover:text-primary-700 font-semibold"
              >
                Xem tất cả
                <Icons.ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {bestsellers.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            
            <div className="text-center mt-12 md:hidden">
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
              >
                Xem tất cả sản phẩm
                <Icons.ArrowRight className="w-5 h-5 ml-2" />
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
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Sản phẩm nổi bật
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Khám phá những sản phẩm mới nhất và chất lượng nhất
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl"
              >
                <Icons.ShoppingBag className="w-5 h-5 mr-2" />
                Khám phá tất cả sản phẩm
                <Icons.ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Sẵn sàng trải nghiệm?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Tham gia hàng nghìn khách hàng hài lòng và khám phá thế giới mua sắm không giới hạn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl"
            >
              <Icons.Users className="w-5 h-5 mr-2" />
              Đăng ký ngay
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-all duration-200"
            >
              <Icons.Heart className="w-5 h-5 mr-2" />
              Khám phá ngay
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
