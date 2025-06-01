import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Features Section */}
      <div className="bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Miễn Phí Vận Chuyển</h3>
              <p className="text-gray-300">Đơn hàng từ 500.000đ trở lên</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Thanh Toán An Toàn</h3>
              <p className="text-gray-300">Bảo mật thông tin 100%</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.RotateCcw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Đổi Trả Dễ Dàng</h3>
              <p className="text-gray-300">30 ngày đổi trả miễn phí</p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Hỗ Trợ 24/7</h3>
              <p className="text-gray-300">Tư vấn mọi lúc mọi nơi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-6">
                <Icons.ShoppingBag className="h-8 w-8 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">TechStore</span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Cửa hàng công nghệ hàng đầu Việt Nam, cung cấp các sản phẩm điện tử chất lượng cao với giá cả hợp lý.
              </p>
              
              {/* Social Media */}              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="bg-gray-800 p-3 rounded-full hover:bg-blue-600 transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <Icons.Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="bg-gray-800 p-3 rounded-full hover:bg-blue-400 transition-colors duration-300"
                  aria-label="Twitter"
                >
                  <Icons.Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="bg-gray-800 p-3 rounded-full hover:bg-pink-600 transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <Icons.Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="#"
                  className="bg-gray-800 p-3 rounded-full hover:bg-red-600 transition-colors duration-300"
                  aria-label="Youtube"
                >
                  <Icons.Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Liên Kết Nhanh</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-300">
                    Trang Chủ
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-gray-300 hover:text-white transition-colors duration-300">
                    Sản Phẩm
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-300">
                    Giới Thiệu
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-300">
                    Liên Hệ
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">
                    Tin Tức
                  </a>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Chăm Sóc Khách Hàng</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">
                    Hướng Dẫn Mua Hàng
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">
                    Chính Sách Đổi Trả
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">
                    Chính Sách Bảo Hành
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">
                    Câu Hỏi Thường Gặp
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">
                    Điều Khoản Dịch Vụ
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Thông Tin Liên Hệ</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Icons.MapPin className="w-5 h-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300">
                      123 Đường ABC, Quận 1,<br />
                      TP. Hồ Chí Minh, Việt Nam
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Icons.Phone className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300">Hotline: 1900 1234</p>
                    <p className="text-gray-400 text-sm">8:00 - 22:00 (T2-CN)</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Icons.Mail className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
                  <p className="text-gray-300">support@techstore.vn</p>
                </div>
              </div>

              {/* Newsletter */}
              <div className="mt-8">
                <h4 className="text-md font-medium mb-4">Đăng Ký Nhận Tin</h4>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-l-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                  />
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors duration-300">
                    Đăng Ký
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-center md:text-left">
              <p className="text-gray-400">
                © {currentYear} TechStore. Tất cả quyền được bảo lưu.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex justify-center md:justify-end space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                Chính Sách Bảo Mật
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                Điều Khoản Sử Dụng
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
