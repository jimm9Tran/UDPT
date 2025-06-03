import axios from 'axios';

const API_HOST = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const API_BASE_URL = `${API_HOST}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Set both Authorization header AND cookie for compatibility
    config.headers.Authorization = `Bearer ${token}`;
    
    // Also set the token as a cookie in the proper format that backend expects
    document.cookie = `session=${JSON.stringify({ jwt: token })}; path=/; SameSite=Lax`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (userData) => api.post('/users/signup', userData),
  signin: (credentials) => api.post('/users/signin', credentials),
  signout: () => api.post('/users/signout'),
  getCurrentUser: () => api.get('/users/currentuser'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  changePassword: (passwordData) => api.put('/users/password', passwordData),
  refreshToken: () => api.post('/users/refresh-token'),
  forgotPassword: (email) => api.post('/users/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/users/reset-password', { token, password }),
};

// Product API
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  getBestsellers: () => api.get('/products/bestsellers'),
  getCategories: () => api.get('/products/categories'),
  getByCategory: (category) => api.get(`/products/category/${category}`),
  searchProducts: (query) => api.get(`/products/search?q=${query}`),
  create: (productData, images = []) => {
    const formData = new FormData();
    
    // Add product data - handle complex objects properly
    Object.keys(productData).forEach(key => {
      if (productData[key] !== undefined && productData[key] !== null) {
        // For complex objects and arrays, stringify them
        if (typeof productData[key] === 'object' && !Array.isArray(productData[key])) {
          formData.append(key, JSON.stringify(productData[key]));
        } else if (Array.isArray(productData[key])) {
          formData.append(key, JSON.stringify(productData[key]));
        } else {
          formData.append(key, productData[key]);
        }
      }
    });
    
    // Add images - filter only File objects (new uploads)
    images.forEach((image) => {
      if (image instanceof File) {
        formData.append('images', image);
      }
    });
    
    return api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id, productData, images = []) => {
    const formData = new FormData();
    
    // Add product data - handle complex objects properly
    Object.keys(productData).forEach(key => {
      if (productData[key] !== undefined && productData[key] !== null) {
        // For complex objects and arrays, stringify them
        if (typeof productData[key] === 'object' && !Array.isArray(productData[key])) {
          formData.append(key, JSON.stringify(productData[key]));
        } else if (Array.isArray(productData[key])) {
          formData.append(key, JSON.stringify(productData[key]));
        } else {
          formData.append(key, productData[key]);
        }
      }
    });

    // Separate new files and existing URLs
    const newFiles = images.filter(image => image instanceof File);
    const existingUrls = images.filter(image => typeof image === 'string');
    
    // Add new images if provided
    newFiles.forEach((image) => {
      formData.append('images', image);
    });
    
    // Add existing image URLs
    existingUrls.forEach((url, index) => {
      formData.append(`existingImages[${index}]`, url);
    });
    
    return api.patch(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  delete: (id) => api.delete(`/products/${id}`),
  createReview: (productId, reviewData) => api.post(`/products/${productId}/reviews`, reviewData),
  
  // Inventory checking functions
  checkInventory: (productId) => {
    // Single product inventory check
    return api.get(`/products/${productId}/inventory`);
  },
  checkMultipleInventory: (productIds) => {
    // Multiple products inventory check
    return api.post('/products/check-inventory', { productIds });
  },
  checkCartInventory: (cartItems) => {
    // Direct cart format for cart page
    const cart = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));
    
    return api.post('/products/check-cart-inventory', { cart });
  },
  reserveInventory: (items) => {
    // Reserve inventory for checkout
    return api.post('/products/reserve-inventory', { items });
  },
  releaseInventory: (reservationId) => {
    // Release previously reserved inventory
    return api.post('/products/release-inventory', { reservationId });
  },
  commitInventory: (reservationId) => {
    // Commit reserved inventory after payment
    return api.post('/products/commit-inventory', { reservationId });
  },
};

// Order API
export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getAllOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/orders/admin${queryString ? `?${queryString}` : ''}`);
  },
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  deliver: (id) => api.put(`/orders/deliver/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  bulkUpdateStatus: (orderIds, status) => api.patch('/orders/bulk-status', { orderIds, status }),
  completeOrder: (id) => api.put(`/orders/${id}/complete`),
  getOrderEvents: (id) => api.get(`/orders/${id}/events`),
  reserveInventory: (items) => api.post('/orders/reserve-inventory', { items }),
};

// Payment API
export const paymentAPI = {
  createVNPay: (paymentData) => api.post('/payments/vnpay', paymentData),
  createCOD: (paymentData) => api.post('/payments/cod', paymentData),
  confirmCOD: (orderId) => api.post(`/payments/cod/confirm/${orderId}`),
  getPayment: (orderId) => api.get(`/payments/order/${orderId}`),
  processPayment: (orderId, paymentType, paymentData) => 
    api.post(`/payments/process/${orderId}`, { type: paymentType, ...paymentData }),
  getPaymentStatus: (orderId) => api.get(`/payments/status/${orderId}`),
  refundPayment: (orderId) => api.post(`/payments/refund/${orderId}`),
};

// Health API
export const healthAPI = {
  check: () => api.get('/health'), // Use relative URL via proxy
  checkServices: async () => {
    try {
      // Use the comprehensive health check endpoint that actually tests services
      // Need to call the health endpoint directly without /api prefix
      const healthResponse = await axios.get(`${API_HOST}/health/services`);
      console.log('🟢 [DEBUG] Health API response:', healthResponse.data);
      return { data: healthResponse.data };
    } catch (error) {
      console.error('🔴 [DEBUG] Health check failed:', error);
      // Return default structure if health check fails
      return {
        data: {
          services: {
            user: { status: 'unknown', url: 'http://user-service:3000', error: 'Health check failed' },
            product: { status: 'unknown', url: 'http://product-service:3000', error: 'Health check failed' },
            order: { status: 'unknown', url: 'http://order-service:3000', error: 'Health check failed' },
            payment: { status: 'unknown', url: 'http://payment-service:3000', error: 'Health check failed' }
          }
        }
      };
    }
  }
};

export default api;
