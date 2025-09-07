import axios from 'axios';
import { toast } from 'react-toastify';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // Don't show error toast for auth routes (handled by components)
    if (!error.config?.url?.includes('/auth/')) {
      toast.error(message);
    }

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);