import React, { useState, useEffect, useMemo } from 'react';
import { productAPI, healthAPI } from '../services/api';
import * as Icons from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import { toast } from 'react-toastify';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    subCategory: '',
    brand: '',
    specifications: {
      processor: '',
      ram: '',
      storage: '',
      display: '',
      battery: '',
      camera: '',
      connectivity: '',
      operatingSystem: '',
      warranty: '12 tháng',
      weight: '',
      dimensions: '',
      color: ''
    },
    features: [],
    inTheBox: [],
    countInStock: '',
    tags: [],
    isActive: true,
    isFeatured: false
  });
  
  // New state variables for improved UI
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [productServiceHealth, setProductServiceHealth] = useState({
    status: 'unknown',
    lastChecked: null
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    checkProductServiceHealth();
  }, []);

  const checkProductServiceHealth = async () => {
    try {
      const response = await healthAPI.checkServices();
      if (response.data.services && response.data.services.product) {
        setProductServiceHealth({
          status: response.data.services.product.status,
          lastChecked: new Date()
        });
      }
    } catch (error) {
      console.error('Error checking product service health:', error);
      setProductServiceHealth({
        status: 'unhealthy',
        lastChecked: new Date(),
        error: error.message
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh mục sản phẩm');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const response = await productAPI.getAll();
      setProducts(response.data);
      
      // Also check service health when fetching products
      checkProductServiceHealth();
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.price || !formData.category || !formData.description || !formData.brand) {
      toast.warning('Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Giá, Danh mục, Mô tả, Thương hiệu)');
      return;
    }

    // Images are now optional - placeholder will be used if none provided

    try {
      if (editingProduct) {
        await productAPI.update(editingProduct.id || editingProduct._id, formData, selectedImages);
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        await productAPI.create(formData, selectedImages);
        toast.success('Tạo sản phẩm thành công!');
      }
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Lỗi khi lưu sản phẩm: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await productAPI.delete(productId);
        toast.success('Xóa sản phẩm thành công!');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Lỗi khi xóa sản phẩm');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      subCategory: '',
      brand: '',
      specifications: {
        processor: '',
        ram: '',
        storage: '',
        display: '',
        battery: '',
        camera: '',
        connectivity: '',
        operatingSystem: '',
        warranty: '12 tháng',
        weight: '',
        dimensions: '',
        color: ''
      },
      features: [],
      inTheBox: [],
      countInStock: '',
      tags: [],
      isActive: true,
      isFeatured: false
    });
    setSelectedImages([]);
    setEditingProduct(null);
    setShowModal(false);
  };

  const handleEdit = (product) => {
    // Prepare form data
    const productToEdit = {
      ...product,
      specifications: product.specifications || {
        processor: '',
        ram: '',
        storage: '',
        display: '',
        battery: '',
        camera: '',
        connectivity: '',
        operatingSystem: '',
        warranty: '12 tháng',
        weight: '',
        dimensions: '',
        color: ''
      },
      features: product.features || [],
      inTheBox: product.inTheBox || [],
      tags: product.tags || []
    };

    setFormData(productToEdit);
    setEditingProduct(product);
    setShowModal(true);
    
    // Handle existing images
    if (product.images) {
      const existingImages = [];
      Object.values(product.images).forEach(image => {
        if (image && typeof image === 'string') {
          existingImages.push(image);
        }
      });
      setSelectedImages(existingImages);
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return <Icons.ArrowDown size={14} className="text-gray-400" />;
    return sortDirection === 'asc' ? <Icons.ArrowUp size={14} className="text-primary-600" /> : <Icons.ArrowDown size={14} className="text-primary-600" />;
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        // Search term filter
        const matchesSearch = 
          product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.id || product._id)?.toString().includes(searchTerm);
        
        // Category filter
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        
        // Stock filter
        const matchesStock = 
          filterStock === 'all' || 
          (filterStock === 'inStock' && product.countInStock > 0) ||
          (filterStock === 'outOfStock' && product.countInStock <= 0);
        
        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        // Convert to lower case for string comparisons
        let valA = a[sortField];
        let valB = b[sortField];
        
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        // Handle null/undefined values
        if (valA === undefined || valA === null) valA = sortDirection === 'asc' ? '' : Infinity;
        if (valB === undefined || valB === null) valB = sortDirection === 'asc' ? '' : Infinity;
        
        // Determine sort order
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, searchTerm, sortField, sortDirection, filterCategory, filterStock]);

  // Form input handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (name.includes('.')) {
      // Handle nested properties (e.g., specifications.processor)
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle arrays like features, inTheBox, tags
  const handleArrayChange = (e, arrayName) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      [arrayName]: value.split('\n').filter(item => item.trim() !== '')
    });
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <div className="flex items-center mt-2">
            <p className="text-gray-600 mr-3">Trạng thái dịch vụ:</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              productServiceHealth.status === 'healthy' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {productServiceHealth.status === 'healthy' 
                ? <Icons.Check size={12} className="mr-1" /> 
                : <Icons.X size={12} className="mr-1" />}
              {productServiceHealth.status === 'healthy' ? 'Hoạt động' : 'Lỗi'}
            </span>
            {productServiceHealth.lastChecked && (
              <span className="text-xs text-gray-500 ml-2">
                Kiểm tra lúc: {productServiceHealth.lastChecked.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-md"
        >
          <Icons.Plus size={16} className="mr-1" />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icons.Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icons.Filter size={16} className="text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="relative flex-1">
              <select
                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
              >
                <option value="all">Tất cả kho</option>
                <option value="inStock">Còn hàng</option>
                <option value="outOfStock">Hết hàng</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between md:justify-end space-x-2">
            <button
              onClick={fetchProducts}
              className={`p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ${isRefreshing ? 'text-primary-600' : 'text-gray-500'}`}
              title="Làm mới"
            >
              <Icons.RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'bg-white text-gray-500'}`}
                title="Chế độ lưới"
              >
                <Icons.Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'bg-white text-gray-500'}`}
                title="Chế độ danh sách"
              >
                <Icons.List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product List */}
      {filteredProducts.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id || product._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={product.images?.image1 || '/api/placeholder/300/200'}
                    alt={product.title}
                    className="w-full h-full object-cover object-center"
                  />
                  {product.countInStock <= 0 && (
                    <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                      Hết hàng
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-primary-600 font-semibold">
                      {product.price?.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-sm text-gray-500">
                      Kho: {product.countInStock || 0}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 flex justify-center items-center px-3 py-2 bg-primary-50 text-primary-600 rounded hover:bg-primary-100 transition-colors"
                    >
                      <Icons.Edit size={16} className="mr-1" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product.id || product._id)}
                      className="flex-1 flex justify-center items-center px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                    >
                      <Icons.Trash2 size={16} className="mr-1" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort('title')}>
                    <div className="flex items-center">
                      <span>Tên sản phẩm</span>
                      {getSortIcon('title')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort('category')}>
                    <div className="flex items-center">
                      <span>Danh mục</span>
                      {getSortIcon('category')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort('price')}>
                    <div className="flex items-center">
                      <span>Giá</span>
                      {getSortIcon('price')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort('countInStock')}>
                    <div className="flex items-center">
                      <span>Kho</span>
                      {getSortIcon('countInStock')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id || product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded-md object-cover" 
                            src={product.images?.image1 || '/api/placeholder/40/40'} 
                            alt={product.title} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.title}</div>
                          <div className="text-sm text-gray-500">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{product.price?.toLocaleString('vi-VN')}đ</div>
                      {product.originalPrice && (
                        <div className="text-xs text-gray-500 line-through">{product.originalPrice?.toLocaleString('vi-VN')}đ</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        product.countInStock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : product.countInStock > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {product.countInStock > 0 ? product.countInStock : 'Hết hàng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => handleEdit(product)}
                          className="flex items-center px-3 py-1 bg-primary-50 text-primary-600 rounded hover:bg-primary-100 transition-colors"
                        >
                          <Icons.Edit size={14} className="mr-1" />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDelete(product.id || product._id)}
                          className="flex items-center px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                        >
                          <Icons.Trash2 size={14} className="mr-1" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <Icons.Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterCategory !== 'all' || filterStock !== 'all'
              ? 'Không có sản phẩm nào phù hợp với bộ lọc của bạn.'
              : 'Chưa có sản phẩm nào. Hãy thêm sản phẩm mới.'}
          </p>
          {(searchTerm || filterCategory !== 'all' || filterStock !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
                setFilterStock('all');
              }}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Icons.RefreshCw size={16} className="mr-2" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>
      )}

      {/* Product Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <Icons.X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thương hiệu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá gốc
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng trong kho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="countInStock"
                    value={formData.countInStock}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục phụ
                  </label>
                  <input
                    type="text"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh sản phẩm
                </label>
                <ImageUpload
                  selectedImages={selectedImages}
                  setSelectedImages={setSelectedImages}
                  maxImages={5}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 col-span-full mb-2">Thông số kỹ thuật</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bộ xử lý
                  </label>
                  <input
                    type="text"
                    name="specifications.processor"
                    value={formData.specifications?.processor || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RAM
                  </label>
                  <input
                    type="text"
                    name="specifications.ram"
                    value={formData.specifications?.ram || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lưu trữ
                  </label>
                  <input
                    type="text"
                    name="specifications.storage"
                    value={formData.specifications?.storage || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Màn hình
                  </label>
                  <input
                    type="text"
                    name="specifications.display"
                    value={formData.specifications?.display || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pin
                  </label>
                  <input
                    type="text"
                    name="specifications.battery"
                    value={formData.specifications?.battery || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Camera
                  </label>
                  <input
                    type="text"
                    name="specifications.camera"
                    value={formData.specifications?.camera || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kết nối
                  </label>
                  <input
                    type="text"
                    name="specifications.connectivity"
                    value={formData.specifications?.connectivity || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hệ điều hành
                  </label>
                  <input
                    type="text"
                    name="specifications.operatingSystem"
                    value={formData.specifications?.operatingSystem || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bảo hành
                  </label>
                  <input
                    type="text"
                    name="specifications.warranty"
                    value={formData.specifications?.warranty || '12 tháng'}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Màu sắc
                  </label>
                  <input
                    type="text"
                    name="specifications.color"
                    value={formData.specifications?.color || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Kích hoạt sản phẩm
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                    Sản phẩm nổi bật
                  </label>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
