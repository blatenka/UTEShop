import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with token handling
const createApiClient = () => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add token to headers if it exists
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Nếu là FormData, xóa Content-Type để browser tự tính
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Handle response errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to home page instead of login
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const apiClient = createApiClient();

// ========== ORDER APIS ==========

// Get all orders (Admin only)
export const getAllOrders = async () => {
  try {
    const response = await apiClient.get('/orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

// Get user's orders
export const getUserOrders = async () => {
  try {
    const response = await apiClient.get('/orders/my-orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

// Create order
export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await apiClient.put(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// User confirm received (Mark as delivered)
export const userConfirmReceived = async (orderId) => {
  try {
    const response = await apiClient.put(`/orders/${orderId}/received`);
    return response.data;
  } catch (error) {
    console.error('Error confirming order receipt:', error);
    throw error;
  }
};

// Cancel order
export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await apiClient.put(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error canceling order:', error);
    throw error;
  }
};

// ========== USER APIS ==========

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/users/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Update user avatar
export const updateUserAvatar = async (formData) => {
  try {
    const response = await apiClient.put('/users/avatar', formData);
    return response.data;
  } catch (error) {
    console.error('Error updating avatar:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await apiClient.put('/users/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Get all users (Admin only)
export const getAllUsers = async () => {
  try {
    const response = await apiClient.get("/users/all");
    return response.data.users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// ========== WISHLIST APIS ==========

// Add to wishlist
export const addToWishlist = async (bookId) => {
  try {
    const response = await apiClient.post('/users/wishlist/add', { id: bookId });
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

// Remove from wishlist
export const removeFromWishlist = async (bookId) => {
  try {
    const response = await apiClient.delete(`/users/wishlist/${bookId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

// Get my wishlist
export const getMyWishlist = async () => {
  try {
    const response = await apiClient.get('/users/wishlist/my');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

// ========== BOOK APIS ==========

// Get categories
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/books/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get all books (Admin)
export const getAllBooks = async () => {
  try {
    const response = await apiClient.get('/books/admin/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

// Create book (Admin)
export const createBook = async (bookData) => {
  try {
    const response = await apiClient.post('/books', bookData);
    return response.data;
  } catch (error) {
    console.error('Error creating book:', error);
    throw error;
  }
};

// Update book (Admin)
export const updateBook = async (bookId, bookData) => {
  try {
    const response = await apiClient.put(`/books/${bookId}`, bookData);
    return response.data;
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
};

// Delete book (Admin)
export const deleteBook = async (bookId) => {
  try {
    const response = await apiClient.delete(`/books/${bookId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
};

// Create book review
export const createBookReview = async (bookId, { rating, comment }) => {
  try {
    const response = await apiClient.post(`/books/${bookId}/reviews`, {
      rating: Number(rating),
      comment,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating book review:', error);
    throw error;
  }
};

export default apiClient;
