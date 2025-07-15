import { createContext, useEffect, useState } from 'react';
// import axios from 'axios';
import api from '@/services/api'; // Use the axios instance you created

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const register = async (userData) => {
    try {
      // Adjust data to match backend expectations
      const dataToSend = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: "viewer" // Default role
      };

      const res = await api.post('/auth/register', dataToSend);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      await fetchUser();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.msg || 'Registration failed');
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      await fetchUser();
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.msg || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint
      await api.post('/auth/logout');

      // Clear frontend state regardless of backend response
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);

      return true; // Indicate success
    } catch (err) {
      console.error('Logout failed:', err);
      // Even if backend logout fails, clear frontend state
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      return false; // Indicate failure
    }
  };

  const fetchUser = async () => {
    if (token) {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        setError(null);
      } catch (err) {
        logout();
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const updateProfile = async (formData) => {
    try {
      const response = await api.patch('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser((prev) => ({ ...prev, ...response.data.user }));
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        updateProfile,
        login,
        logout,
        fetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};