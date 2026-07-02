import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const refreshTimerRef = useRef(null);

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setTokenExpiry(null);
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    }
  };

  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await api.refreshToken();

      if (response.token_expiry_minutes) {
        setTokenExpiry(new Date().getTime() + response.token_expiry_minutes * 60 * 1000);
      }
    } catch (err) {
      console.error('Failed to refresh token:', err);
      logout();
    }
  }, []);

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
        setError(null);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !tokenExpiry) {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      return undefined;
    }

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const now = new Date().getTime();
    const timeUntilExpiry = tokenExpiry - now;
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 1000);

    refreshTimerRef.current = setTimeout(() => {
      refreshAccessToken();
    }, refreshTime);

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [isAuthenticated, tokenExpiry, refreshAccessToken]);

  const register = async (name, email, password) => {
    try {
      setError(null);

      const response = await api.register({ name, email, password });
      setUser(response.user);
      setIsAuthenticated(true);

      if (response.token_expiry_minutes) {
        setTokenExpiry(new Date().getTime() + response.token_expiry_minutes * 60 * 1000);
      }

      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.error?.details || err.message || 'Registration failed';
      setError(errorMsg);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);

      const response = await api.login({ email, password });
      setUser(response.user);
      setIsAuthenticated(true);

      if (response.token_expiry_minutes) {
        setTokenExpiry(new Date().getTime() + response.token_expiry_minutes * 60 * 1000);
      }

      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || 'Login failed';
      setError(errorMsg);
      throw err;
    }
  };

  const updateProfile = async (name) => {
    try {
      setError(null);

      const updatedUser = await api.updateProfile({ name });
      setUser(updatedUser);

      return updatedUser;
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || 'Update failed';
      setError(errorMsg);
      throw err;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);

      const updatedUser = await api.changePassword({ current_password: currentPassword, new_password: newPassword });
      setUser(updatedUser);

      return updatedUser;
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || 'Password change failed';
      setError(errorMsg);
      throw err;
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
