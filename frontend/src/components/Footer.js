import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 shadow-lg">

      {/* Main Footer Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-lg">J</span>
                </div>
                <span className="text-2xl font-bold text-gradient">Jimm9-Shop</span>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Cửa hàng công nghệ hàng đầu Việt Nam, cung cấp các sản phẩm điện tử chất lượng cao với giá cả hợp lý.
              </p>
              
              {/* Social Media */}
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="bg-gray-100 p-3 rounded-full hover:bg-gradient-to-r hover:from-primary-600 hover:to-primary-800 hover:text-white transition-all duration-300 text-gray-600"
                  aria-label="Facebook"
                >
                  <Icons.Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="bg-gray-100 p-3 rounded-full hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-600 hover:text-white transition-all duration-300 text-gray-600"
                  aria-label="Twitter"
                >
                  <Icons.Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="bg-gray-100 p-3 rounded-full hover:bg-gradient-to-r hover:from-pink-500 hover:to-pink-700 hover:text-white transition-all duration-300 text-gray-600"
                  aria-label="Instagram"
                >
                  <Icons.Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="#"
                  className="bg-gray-100 p-3 rounded-full hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700 hover:text-white transition-all duration-300 text-gray-600"
                  aria-label="Youtube"
                >
                  <Icons.Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-gray-900">Liên Kết Nhanh</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors duration-300">
                    Trang Chủ
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-gray-600 hover:text-primary-600 transition-colors duration-300">
                    Sản Phẩm
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-600 hover:text-primary-600 transition-colors duration-300">
                    Giới Thiệu
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 hover:text-primary-600 transition-colors duration-300">
                    Liên Hệ
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors duration-300">
                    Tin Tức
                  </a>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-gray-900">Chăm Sóc Khách Hàng</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors duration-300">
                    Hướng Dẫn Mua Hàng
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors duration-300">
                    Chính Sách Đổi Trả
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors duration-300">
                    Chính Sách Bảo Hành
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors duration-300">
                    Câu Hỏi Thường Gặp
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors duration-300">
                    Điều Khoản Dịch Vụ
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-gray-900">Thông Tin Liên Hệ</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Icons.MapPin className="w-5 h-5 text-primary-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600">
                      123 Đường ABC, Quận Bắc Từ Liêm,<br />
                      TP. Hà Nội, Việt Nam
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Icons.Phone className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600">Hotline: 1900 1234</p>
                    <p className="text-gray-500 text-sm">8:00 - 22:00 (T2-CN)</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Icons.Mail className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0" />
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
                    className="flex-1 px-4 py-2 bg-gray-50 text-gray-900 rounded-l-lg border border-gray-200 focus:outline-none focus:border-primary-500 focus:bg-white"
                  />
                  <button className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-r-lg hover:from-primary-700 hover:to-primary-900 transition-all duration-300">
                    Đăng Ký
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-center md:text-left">
              <p className="text-gray-500">
                © {currentYear} Jimm9-Shop. Tất cả quyền được bảo lưu.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex justify-center md:justify-end space-x-6">
              <a href="#" className="text-gray-500 hover:text-primary-600 transition-colors duration-300">
                Chính Sách Bảo Mật
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600 transition-colors duration-300">
                Điều Khoản Sử Dụng
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600 transition-colors duration-300">
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
