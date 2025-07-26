import axios from 'axios';

const api = axios.create({
  
  baseURL: import.meta.env.VITE_API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Ensure multipart/form-data is not overridden
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

export default api;