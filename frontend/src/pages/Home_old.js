import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { 
  ArrowRight, Star, Shield, Truck, CreditCard, 
  Zap, Heart, Award, Users, ShoppingBag, TrendingUp 
} from 'lucide-react';

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
                  <TrendingUp className="w-4 h-4 mr-2" />
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
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Khám phá ngay
                  <ArrowRight className="w-5 h-5 ml-2" />
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
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Chào mừng đến 
              <span className="block text-secondary-300">Jimm9-Shop</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              Khám phá hàng ngàn sản phẩm công nghệ chất lượng cao với giá tốt nhất. 
              <span className="block mt-2 text-primary-200">Hệ thống microservices hiện đại cho trải nghiệm mua sắm tuyệt vời.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              <Link
                to="/products"
                className="group bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Khám phá ngay
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-300 shadow-lg"
              >
                Đăng ký miễn phí
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-slide-up">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">1000+</div>
                <div className="text-primary-200">Sản phẩm</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">50K+</div>
                <div className="text-primary-200">Khách hàng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">99.9%</div>
                <div className="text-primary-200">Độ tin cậy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn Jimm9-Shop?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất với dịch vụ chuyên nghiệp
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                <Truck className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Giao hàng nhanh</h3>
              <p className="text-gray-600 leading-relaxed">Giao hàng miễn phí cho đơn hàng trên 500.000đ, cam kết giao trong 24h</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-success-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-success-200 transition-colors">
                <CreditCard className="text-success-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Thanh toán đa dạng</h3>
              <p className="text-gray-600 leading-relaxed">Hỗ trợ VNPay, thanh toán khi nhận hàng và các phương thức an toàn</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-secondary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary-200 transition-colors">
                <Shield className="text-secondary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Bảo mật tuyệt đối</h3>
              <p className="text-gray-600 leading-relaxed">Hệ thống microservices với bảo mật JWT và mã hóa dữ liệu cao cấp</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-danger-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-danger-200 transition-colors">
                <Star className="text-danger-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Chất lượng đảm bảo</h3>
              <p className="text-gray-600 leading-relaxed">Sản phẩm chính hãng 100%, bảo hành đầy đủ và chính sách đổi trả linh hoạt</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      {bestsellers.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Sản phẩm bán chạy
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Những sản phẩm được yêu thích nhất bởi khách hàng
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {bestsellers.map((product) => (
                <div key={product._id || product.id} className="card-hover">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link
                to="/products"
                className="btn-primary inline-flex items-center"
              >
                Xem tất cả sản phẩm
                <ArrowRight size={20} className="ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Sản phẩm nổi bật
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Khám phá các sản phẩm công nghệ mới nhất và chất lượng nhất
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <div key={product._id || product.id} className="card-hover">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Bắt đầu mua sắm ngay hôm nay!
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Đăng ký tài khoản để nhận được ưu đãi độc quyền và cập nhật sản phẩm mới nhất
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Đăng ký miễn phí
            </Link>
            <Link
              to="/products"
              className="border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-300"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
