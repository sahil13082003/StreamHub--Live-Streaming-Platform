import axios from 'axios';

const api = axios.create({
  // baseURL: 'stream-hub-live-streaming-platform-alpha.vercel.app/api',
  baseURL: 'http://localhost:5000/api', // Change to your backend URL
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