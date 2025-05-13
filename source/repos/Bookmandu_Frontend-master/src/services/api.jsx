import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5036";

// Create axios instance with default config
const api = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('username', response.data.username);
        if (response.data.userId) {
          localStorage.setItem('userId', response.data.userId);
        }
        // Return complete user data
        return {
          token: response.data.token,
          username: response.data.username,
          role: response.data.role,
          id: response.data.userId
        };
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  getToken: () => {
    return localStorage.getItem('token');
  },
  getUserRole: () => {
    return localStorage.getItem('userRole');
  }
};

// Book Services
export const bookService = {
  getBooks: async () => {
    try {
      const response = await api.get('/api/books');
      return response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch books');
    }
  },
  getBookById: async (id) => {
    try {
      const response = await api.get(`/api/books/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching book:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch book details');
    }
  },
  createBook: async (bookData) => {
    try {
      const response = await api.post('/api/books', bookData);
      return response.data;
    } catch (error) {
      console.error('Error creating book:', error);
      throw new Error(error.response?.data?.message || 'Failed to create book');
    }
  },
  updateBook: async (id, bookData) => {
    try {
      const response = await api.put(`/api/books/${id}`, bookData);
      return response.data;
    } catch (error) {
      console.error('Error updating book:', error);
      throw new Error(error.response?.data?.message || 'Failed to update book');
    }
  },
  deleteBook: async (id) => {
    try {
      const response = await api.delete(`/api/books/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete book');
    }
  },
  getPaginatedBooks: async (page = 1, pageSize = 10) => {
    const response = await api.get(`/books/catalog?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },
  getFilteredBooks: async (filters) => {
    const response = await api.get('/books/filter', { params: filters });
    return response.data;
  },
  uploadBookImage: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post(`/api/books/${id}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error('Error uploading book image:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload book image');
    }
  },
};

// Cart Services
export const cartService = {
  getCart: async () => {
    const response = await api.get('/api/cart');
    return response.data;
  },
  addToCart: async (bookId, quantity = 1) => {
    const response = await api.post('/api/cart', { bookId, quantity });
    return response.data;
  },
  updateCartItem: async (cartItemId, data) => {
    const response = await api.put(`/api/cart/${cartItemId}`, data);
    return response.data;
  },
  removeFromCart: async (cartItemId) => {
    const response = await api.delete(`/api/cart/${cartItemId}`);
    return response.data;
  },
  clearCart: async () => {
    const response = await api.delete('/api/cart');
    return response.data;
  }
};

// Wishlist Services
export const wishlistService = {
  addToWishlist: async (bookId) => {
    const response = await api.post('/api/wishlist', { bookId });
    return response.data;
  },
  getWishlist: async () => {
    const response = await api.get('/api/wishlist');
    return response.data;
  },
  removeFromWishlist: async (bookId) => {
    const response = await api.delete(`/api/wishlist/${bookId}`);
    return response.data;
  },
};

// Order Services
export const orderService = {
  placeOrder: async (orderData) => {
    const response = await api.post('/api/order', orderData);
    return response.data;
  },
  getOrders: async () => {
    const response = await api.get('/api/order');
    return response.data;
  },
  getOrderById: async (orderId) => {
    const response = await api.get(`/api/order/${orderId}`);
    return response.data;
  },
  cancelOrder: async (orderId) => {
    const response = await api.delete(`/api/order/${orderId}`);
    return response.data;
  },
  processOrder: async (processData) => {
    const response = await api.post('/api/order/process', processData);
    return response.data;
  },
  getAllOrders: async () => {
    const response = await api.get('/api/order/all');
    return response.data;
  },
  getCompletedOrders: async () => {
    const response = await api.get('/api/order');
    return response.data.filter(order =>
      (order.status === 'Completed' || order.Status === 'Completed')
    );
  },
};

// Author Services
export const authorService = {
  getAll: async () => {
    try {
      const response = await api.get('/api/authors');
      return response.data;
    } catch (error) {
      console.error('Error fetching authors:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch authors');
    }
  },
  create: async (authorName) => {
    try {
      const response = await api.post('/api/authors', { authorName });
      return response.data;
    } catch (error) {
      console.error('Error creating author:', error);
      throw new Error(error.response?.data?.message || 'Failed to create author');
    }
  },
  update: async (id, authorName) => {
    try {
      const response = await api.put(`/api/authors/${id}`, { authorName });
      return response.data;
    } catch (error) {
      console.error('Error updating author:', error);
      throw new Error(error.response?.data?.message || 'Failed to update author');
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/api/authors/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting author:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete author');
    }
  }
};

// Genre Services
export const genreService = {
  getAll: async () => {
    try {
      const response = await api.get('/api/genres');
      return response.data;
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch genres');
    }
  },
  create: async (genreName) => {
    try {
      const response = await api.post('/api/genres', { genreName });
      return response.data;
    } catch (error) {
      console.error('Error creating genre:', error);
      throw new Error(error.response?.data?.message || 'Failed to create genre');
    }
  },
  update: async (id, genreName) => {
    try {
      const response = await api.put(`/api/genres/${id}`, { genreName });
      return response.data;
    } catch (error) {
      console.error('Error updating genre:', error);
      throw new Error(error.response?.data?.message || 'Failed to update genre');
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/api/genres/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting genre:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete genre');
    }
  }
};

// Publisher Services
export const publisherService = {
  getAll: async () => {
    try {
      const response = await api.get('/api/publishers');
      return response.data;
    } catch (error) {
      console.error('Error fetching publishers:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch publishers');
    }
  },
  create: async (publisherName, publisherCountry) => {
    try {
      const response = await api.post('/api/publishers', { publisherName, publisherCountry });
      return response.data;
    } catch (error) {
      console.error('Error creating publisher:', error);
      throw new Error(error.response?.data?.message || 'Failed to create publisher');
    }
  },
  update: async (id, publisher) => {
    try {
      const response = await api.put(`/api/publishers/${id}`, publisher);
      return response.data;
    } catch (error) {
      console.error('Error updating publisher:', error);
      throw new Error(error.response?.data?.message || 'Failed to update publisher');
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/api/publishers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting publisher:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete publisher');
    }
  }
};

// User Services
export const userService = {
  registerStaff: async (userData) => {
    try {
      const response = await api.post('/api/user/register-staff', userData);
      return response.data;
    } catch (error) {
      console.error('Staff registration error:', error);
      throw new Error(error.response?.data?.message || 'Staff registration failed');
    }
  },
  getMembers: async () => {
    try {
      const response = await api.get('/api/user/members');
      return response.data;
    } catch (error) {
      console.error('Error fetching members:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch members');
    }
  },
  getStaff: async () => {
    // This endpoint doesn't exist in your current API, so we're adding it for future use
    // You'll need to add a Controller method for this later
    try {
      const response = await api.get('/api/user/staff');
      return response.data;
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch staff');
    }
  },
};

// Review Services
export const reviewService = {
  addReview: async (reviewData) => {
    const response = await api.post('/api/review', reviewData);
    return response.data;
  },
  getReviewsByBookId: async (bookId) => {
    const response = await api.get(`/api/review/${bookId}`);
    return response.data;
  }
};

// Discount Services
export const discountService = {
  addDiscount: async (discountData) => {
    const response = await api.post('/api/discount', discountData);
    return response.data;
  },
  getDiscountByBookId: async (bookId) => {
    const response = await api.get(`/api/discount/${bookId}`);
    return response.data;
  },
  getAllDiscounts: async () => {
    const response = await api.get('/api/discount');
    return response.data;
  }
};

// Notification Service
export const notificationService = {
  getNotifications: async (userId) => {
    try {
      const response = await api.get(`/api/Notification/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/api/Notification/${notificationId}/mark-as-read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  markAllAsRead: async () => {
    // This endpoint is not present in your backend, so you may need to implement it if required
    throw new Error('markAllAsRead endpoint not implemented in backend');
  }
};

export const announcementService = {
  getAnnouncements: async () => {
    const response = await api.get('/api/announcement/active');
    return response.data.map(announcement => ({
      id: announcement.announcementId,
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      startTime: announcement.startTime,
      endTime: announcement.endTime,
      isActive: announcement.isActive
    }));
  },
  createAnnouncement: async (announcementData) => {
    const response = await api.post('/api/announcement', {
      title: announcementData.title,
      content: announcementData.content,
      type: announcementData.type, // 'Live' or 'Timed'
      startTime: announcementData.type === 'Timed' ? announcementData.startTime : null,
      endTime: announcementData.type === 'Timed' ? announcementData.endTime : null
    });
    return response.data;
  },
  updateAnnouncement: async (id, announcementData) => {
    const response = await api.put(`/api/announcement/${id}`, {
      title: announcementData.title,
      content: announcementData.content,
      type: announcementData.type, // 'Live' or 'Timed'
      startTime: announcementData.type === 'Timed' ? announcementData.startTime : null,
      endTime: announcementData.type === 'Timed' ? announcementData.endTime : null
    });
    return response.data;
  },
  deactivateAnnouncement: async (id) => {
    const response = await api.put(`/api/announcement/${id}/deactivate`);
    return response.data;
  }
};

export default api; 