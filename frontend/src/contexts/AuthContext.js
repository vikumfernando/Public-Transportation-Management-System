import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Set auth token in axios headers and local state
  const setAuthToken = useCallback((newToken) => {
    if (newToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      localStorage.setItem('token', newToken);
      setTokenState(newToken);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setTokenState(null);
    }
  }, []);

  // Set token when it changes
  const setToken = useCallback((newToken) => {
    setTokenState(newToken);
    setAuthToken(newToken);
  }, [setAuthToken]);

  // Load user from localStorage on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Register user
  const register = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post('/auth/signup', formData);
      // Backend doesn't return token, just user data
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { 
        success: false, 
        error: {
          message: errorMessage,
          details: err.response?.data?.errors || {}
        } 
      };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post('http://localhost:8070/auth/signin', formData);
      // Backend doesn't return token, just user data
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Role-based redirection
      const userRole = res.data.user.role;
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        // For passengers and drivers, go to location page
        navigate('/location');
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { 
        success: false, 
        error: {
          message: errorMessage,
          details: err.response?.data?.errors || {}
        } 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = useCallback(() => {
    // Clear all authentication data
    setToken(null);
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('remember_email');
    
    // Clear browser history to prevent back navigation
    window.history.replaceState(null, '', '/');
    
    // Navigate to landing page and replace history
    navigate('/', { replace: true });
  }, [navigate]);

  // Clear errors
  const clearErrors = useCallback(() => setError(null), []);

  // Set up axios response interceptor for handling 401 errors
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    clearErrors,
    isAuthenticated: !!user,
    setUser,
    setToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
