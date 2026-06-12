import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshTimerRef = useRef(null);
  const tokenExpiryRef = useRef(null);

  // Restore authentication from server on mount
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
        setError(null);
      } catch (err) {
        // Not authenticated or session expired
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  // Set up token refresh timer
  useEffect(() => {
    if (isAuthenticated && tokenExpiryRef.current) {
      // Clear existing timer
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      // Refresh token 5 minutes before expiration
      const now = new Date().getTime();
      const expiryTime = tokenExpiryRef.current;
      const timeUntilExpiry = expiryTime - now;
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 1000); // Refresh 5 min before expiry or in 1 sec

      if (refreshTime > 0) {
        refreshTimerRef.current = setTimeout(() => {
          refreshAccessToken();
        }, refreshTime);
      }
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [isAuthenticated, tokenExpiryRef.current]);

  const refreshAccessToken = async () => {
    try {
      // Get refresh token from cookie (http-only, automatically sent by browser)
      const response = await api.refreshToken();
      
      // Response contains new token expiry info
      if (response.token_expiry_minutes) {
        const expiryTime = new Date().getTime() + response.token_expiry_minutes * 60 * 1000;
        tokenExpiryRef.current = expiryTime;
      }
    } catch (err) {
      console.error('Failed to refresh token:', err);
      // If refresh fails, logout user
      logout();
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.register({ name, email, password });
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Set token expiry time for refresh scheduling
      if (response.token_expiry_minutes) {
        const expiryTime = new Date().getTime() + response.token_expiry_minutes * 60 * 1000;
        tokenExpiryRef.current = expiryTime;
      }
      
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.error?.details || err.message || 'Registration failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.login({ email, password });
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Set token expiry time for refresh scheduling
      if (response.token_expiry_minutes) {
        const expiryTime = new Date().getTime() + response.token_expiry_minutes * 60 * 1000;
        tokenExpiryRef.current = expiryTime;
      }
      
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || 'Login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      tokenExpiryRef.current = null;
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      setLoading(false);
    }
  };

  const updateProfile = async (name) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await api.updateProfile({ name });
      setUser(updatedUser);
      
      return updatedUser;
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || 'Update failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await api.changePassword({ current_password: currentPassword, new_password: newPassword });
      setUser(updatedUser);
      
      return updatedUser;
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || 'Password change failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
