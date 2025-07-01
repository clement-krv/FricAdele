import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Configuration globale d'axios
axios.defaults.baseURL = API_URL;

// Intercepteur pour ajouter automatiquement le token d'authentification
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🔍 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs globalement
axios.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
    
    // Gestion spécifique des erreurs
    if (error.response?.status === 401) {
      // Token invalide ou expiré - rediriger vers la page de connexion
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 429) {
      // Rate limiting - afficher un message informatif
      const retryAfter = error.response.data?.retryAfter || 60;
      console.warn(`⏱️ Rate limit atteint. Réessayez dans ${retryAfter} secondes.`);
      
      // On peut ajouter une notification toast ici si vous avez un système de notifications
      if (window.showNotification) {
        window.showNotification(`Trop de requêtes. Attendez ${retryAfter} secondes.`, 'warning');
      }
    }
    
    return Promise.reject(error);
  }
);

export const expenseAPI = {
  // Get all expenses
  getExpenses: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await axios.get(`/expenses?${params}`);
    return response.data;
  },

  // Get single expense
  getExpense: async (id) => {
    const response = await axios.get(`/expenses/${id}`);
    return response.data;
  },

  // Create expense
  createExpense: async (expenseData) => {
    const response = await axios.post(`/expenses`, expenseData);
    return response.data;
  },

  // Update expense
  updateExpense: async (id, expenseData) => {
    const response = await axios.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  // Delete expense
  deleteExpense: async (id) => {
    const response = await axios.delete(`/expenses/${id}`);
    return response.data;
  },

  // Get expenses by date range
  getExpensesByDateRange: async (startDate, endDate) => {
    const response = await axios.get(`/expenses/date-range`, {
      params: { startDate, endDate }
    });
    return response.data;
  },
};

export const categoryAPI = {
  // Get all categories
  getCategories: async () => {
    const response = await axios.get(`/categories`);
    return response.data;
  },

  // Create category
  createCategory: async (categoryData) => {
    const response = await axios.post(`/categories`, categoryData);
    return response.data;
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    const response = await axios.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id) => {
    const response = await axios.delete(`/categories/${id}`);
    return response.data;
  },
};

export const tagAPI = {
  // Get all tags
  getTags: async () => {
    const response = await axios.get(`/tags`);
    return response.data;
  },

  // Create tag
  createTag: async (tagData) => {
    const response = await axios.post(`/tags`, tagData);
    return response.data;
  },

  // Update tag
  updateTag: async (id, tagData) => {
    const response = await axios.put(`/tags/${id}`, tagData);
    return response.data;
  },

  // Delete tag
  deleteTag: async (id) => {
    const response = await axios.delete(`/tags/${id}`);
    return response.data;
  },
};

export const statisticsAPI = {
  // Get monthly statistics
  getMonthlyStats: async (year, month) => {
    const response = await axios.get(`/statistics/monthly`, {
      params: { year, month }
    });
    return response.data;
  },

  // Get yearly statistics
  getYearlyStats: async (year) => {
    const response = await axios.get(`/statistics/yearly`, {
      params: { year }
    });
    return response.data;
  },

  // Get category distribution
  getCategoryDistribution: async (startDate, endDate) => {
    const response = await axios.get(`/statistics/categories`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get spending trends
  getSpendingTrends: async (months = 12) => {
    const response = await axios.get(`/statistics/trends`, {
      params: { months }
    });
    return response.data;
  },
};

export const authAPI = {
  // Login
  login: async (email, password) => {
    const response = await axios.post(`/auth/login`, {
      email,
      password
    });
    return response.data;
  },

  // Register
  register: async (name, email, password) => {
    const response = await axios.post(`/auth/register`, {
      name,
      email,
      password
    });
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const response = await axios.post(`/auth/forgot-password`, {
      email
    });
    return response.data;
  },

  // Reset Password
  resetPassword: async (token, password) => {
    const response = await axios.post(`/auth/reset-password`, {
      token,
      password
    });
    return response.data;
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await axios.get(`/auth/me`);
    return response.data;
  },

  // Update Profile
  updateProfile: async (profileData) => {
    const response = await axios.put(`/auth/profile`, profileData);
    return response.data;
  },
};
