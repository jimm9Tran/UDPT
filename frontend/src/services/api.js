import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
};

// Product API
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  getBestsellers: () => api.get('/products/bestseller'),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  createReview: (productId, reviewData) => api.post(`/products/${productId}/reviews`, reviewData),
};

// Order API
export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getAllOrders: () => api.get('/orders/all'),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  deliver: (id) => api.put(`/orders/deliver/${id}`),
};

// Payment API
export const paymentAPI = {
  createVNPay: (paymentData) => api.post('/payments/vnpay', paymentData),
  createCOD: (paymentData) => api.post('/payments/cod', paymentData),
  confirmCOD: (orderId) => api.post(`/payments/cod/confirm/${orderId}`),
  getPayment: (orderId) => api.get(`/payments/order/${orderId}`),
};

export default api;
