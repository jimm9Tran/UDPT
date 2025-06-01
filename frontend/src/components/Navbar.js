import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { healthAPI } from '../services/api';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesStatus, setServicesStatus] = useState({});
  const [showStatus, setShowStatus] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // Check services health
  const checkServicesHealth = async () => {
    setStatusLoading(true);
    try {
      const response = await healthAPI.checkServices();
      setServicesStatus(response.data.services);
    } catch (error) {
      console.error('Failed to check services health:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  // Toggle services status dropdown
  const toggleServicesStatus = () => {
    if (!showStatus) {
      checkServicesHealth();
    }
    setShowStatus(!showStatus);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="text-2xl font-bold text-gradient group-hover:scale-105 transition-transform">
              Jimm9-Shop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium relative group"
            >
              Trang chủ
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              to="/products" 
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium relative group"
            >
              Sản phẩm
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full"></span>
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Services Status */}
            <div className="relative">
              <button 
                className="p-2 text-gray-700 hover:text-primary-600 transition-colors hover:bg-primary-50 rounded-lg flex items-center"
                onClick={toggleServicesStatus}
              >
                <Icons.Server size={22} className="mr-1" />
                <span className="text-sm font-medium">Services</span>
              </button>
              
              {/* Services Status Dropdown */}
              {showStatus && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Microservices Status</h3>
                    <button 
                      onClick={checkServicesHealth}
                      className="text-primary-600 hover:text-primary-700 text-xs font-medium flex items-center"
                      disabled={statusLoading}
                    >
                      <Icons.Activity size={14} className="mr-1" />
                      {statusLoading ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(servicesStatus).length > 0 ? (
                      Object.entries(servicesStatus).map(([name, service]) => (
                        <div key={name} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                          <div className="flex items-center">
                            {service.status === 'healthy' ? (
                              <Icons.CheckCircle size={16} className="text-green-500 mr-2" />
                            ) : (
                              <Icons.AlertTriangle size={16} className="text-red-500 mr-2" />
                            )}
                            <span className="text-sm font-medium capitalize">{name}</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            service.status === 'healthy' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {service.status === 'healthy' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      ))
                    ) : statusLoading ? (
                      <div className="text-center py-3">
                        <div className="animate-spin h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-xs text-gray-500">Checking services...</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-3">No service information available</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors hover:bg-primary-50 rounded-lg"
            >
              <Icons.ShoppingCart size={24} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-bounce-gentle">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <Icons.User size={18} className="text-primary-600" />
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user?.name || user?.email?.split('@')[0]}
                    </span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-custom-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name || 'Người dùng'}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Icons.Settings size={16} className="mr-3 text-gray-400" />
                        Đơn hàng của tôi
                      </Link>
                      {user?.isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Icons.Settings size={16} className="mr-3 text-gray-400" />
                          Quản trị
                        </Link>
                      )}
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                      >
                        <Icons.LogOut size={16} className="mr-3" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <Icons.X size={24} /> : <Icons.Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Trang chủ
              </Link>
              <Link
                to="/products"
                onClick={closeMobileMenu}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Sản phẩm
              </Link>
              
              {!isAuthenticated ? (
                <div className="pt-4 space-y-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-base font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Đăng ký
                  </Link>
                </div>
              ) : (
                <div className="pt-4 space-y-2 border-t border-gray-200">
                  <Link
                    to="/orders"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Đơn hàng của tôi
                  </Link>
                  {user?.isAdmin && (
                    <Link
                      to="/admin"
                      onClick={closeMobileMenu}
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Quản trị
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
