import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
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

  // Load user on initial load or when token changes
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        if (token) {
          setAuthToken(token);
          // Add an API call to get user data if needed
          try {
            const res = await axios.get('/api/auth/me');
            setUser(res.data);
          } catch (err) {
            console.error('Error fetching user data', err);
            // If token is invalid, clear it
            if (err.response?.status === 401) {
              logout();
            }
          }
        }
      } catch (err) {
        console.error('Error in loadUser', err);
        setError(err.response?.data?.message || 'Error loading user');
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token, setAuthToken]);

  // Register user
  const register = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post('/api/auth/register', formData);
      setToken(res.data.token);
      setUser(res.data.user);
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
      const res = await axios.post('/api/auth/login', formData);
      setToken(res.data.token);
      setUser(res.data.user);
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
    setToken(null);
    setUser(null);
    setAuthToken(null);
    navigate('/login');
  }, [navigate, setAuthToken]);

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
    isAuthenticated: !!token,
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
