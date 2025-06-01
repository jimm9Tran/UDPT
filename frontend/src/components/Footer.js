import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100">
      {/* Features Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-primary-600 to-primary-800 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Icons.Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Miễn Phí Vận Chuyển</h3>
              <p className="text-gray-600">Đơn hàng từ 500.000đ trở lên</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-green-700 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Icons.Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Thanh Toán An Toàn</h3>
              <p className="text-gray-600">Bảo mật thông tin 100%</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-purple-700 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Icons.RotateCcw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Đổi Trả Dễ Dàng</h3>
              <p className="text-gray-600">30 ngày đổi trả miễn phí</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-red-500 to-red-700 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Icons.Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Hỗ Trợ 24/7</h3>
              <p className="text-gray-600">Tư vấn mọi lúc mọi nơi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center space-x-2 group mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">J</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                  Jimm9-Shop
                </span>
              </Link>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Cửa hàng công nghệ hàng đầu Việt Nam, cung cấp các sản phẩm điện tử chất lượng cao với giá cả hợp lý.
              </p>
              
              {/* Social Media */}
              <div className="flex space-x-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 group"
                  aria-label="Facebook"
                >
                  <Icons.Facebook className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 p-3 rounded-lg hover:bg-blue-50 hover:text-blue-400 transition-all duration-300 group"
                  aria-label="Twitter"
                >
                  <Icons.Twitter className="w-5 h-5 text-gray-600 group-hover:text-blue-400" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 p-3 rounded-lg hover:bg-pink-50 hover:text-pink-600 transition-all duration-300 group"
                  aria-label="Instagram"
                >
                  <Icons.Instagram className="w-5 h-5 text-gray-600 group-hover:text-pink-600" />
                </a>
                <a 
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 p-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
                  aria-label="Youtube"
                >
                  <Icons.Youtube className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-gray-900">Liên Kết Nhanh</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors duration-300 font-medium relative group">
                    Trang Chủ
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-gray-600 hover:text-primary-600 transition-colors duration-300 font-medium relative group">
                    Sản Phẩm
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-600 hover:text-primary-600 transition-colors duration-300 font-medium relative group">
                    Giới Thiệu
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 hover:text-primary-600 transition-colors duration-300 font-medium relative group">
                    Liên Hệ
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full"></span>
                  </Link>
                </li>
                <li>
                  <button className="text-gray-600 hover:text-primary-600 transition-colors duration-300 text-left font-medium">
                    Tin Tức
                  </button>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-gray-900">Chăm Sóc Khách Hàng</h3>
              <ul className="space-y-3">
                <li>
                  <button className="text-gray-600 hover:text-primary-600 transition-colors duration-300 text-left font-medium">
                    Hướng Dẫn Mua Hàng
                  </button>
                </li>
                <li>
                  <button className="text-gray-600 hover:text-primary-600 transition-colors duration-300 text-left font-medium">
                    Chính Sách Đổi Trả
                  </button>
                </li>
                <li>
                  <button className="text-gray-600 hover:text-primary-600 transition-colors duration-300 text-left font-medium">
                    Chính Sách Bảo Hành
                  </button>
                </li>
                <li>
                  <button className="text-gray-600 hover:text-primary-600 transition-colors duration-300 text-left font-medium">
                    Câu Hỏi Thường Gặp
                  </button>
                </li>
                <li>
                  <button className="text-gray-600 hover:text-primary-600 transition-colors duration-300 text-left font-medium">
                    Điều Khoản Dịch Vụ
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-gray-900">Thông Tin Liên Hệ</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Icons.MapPin className="w-5 h-5 text-primary-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600">
                      123 Đường ABC, Quận 1,<br />
                      TP. Hồ Chí Minh, Việt Nam
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Icons.Phone className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600">Hotline: 1900 1234</p>
                    <p className="text-gray-500 text-sm">8:00 - 22:00 (T2-CN)</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Icons.Mail className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" />
                  <p className="text-gray-600">support@jimm9shop.vn</p>
                </div>
              </div>

              {/* Newsletter */}
              <div className="mt-8">
                <h4 className="text-md font-medium mb-4 text-gray-900">Đăng Ký Nhận Tin</h4>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    className="flex-1 px-4 py-2 bg-white text-gray-900 rounded-l-lg border border-gray-300 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  />
                  <button className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-r-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg">
                    Đăng Ký
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-center md:text-left">
              <p className="text-gray-600">
                © {currentYear} Jimm9-Shop. Tất cả quyền được bảo lưu.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex justify-center md:justify-end space-x-6">
              <button className="text-gray-600 hover:text-primary-600 transition-colors duration-300 font-medium">
                Chính Sách Bảo Mật
              </button>
              <button className="text-gray-600 hover:text-primary-600 transition-colors duration-300 font-medium">
                Điều Khoản Sử Dụng
              </button>
              <button className="text-gray-600 hover:text-primary-600 transition-colors duration-300 font-medium">
                Sitemap
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
