import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authAPI,
  setAuthToken,
  getAuthToken,
  setRefreshToken,
  clearAuthTokens,
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session on initial mount
  const checkAuth = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authAPI.getMe();
      if (res.data?.success && res.data.data?.user) {
        setUser(res.data.data.user);
      } else {
        setUser(null);
        clearAuthTokens();
      }
    } catch (err) {
      setUser(null);
      clearAuthTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Customer Login
  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data?.success) {
      const { user: userData, accessToken, refreshToken } = res.data.data;
      setAuthToken(accessToken);
      if (refreshToken) setRefreshToken(refreshToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  // Admin Login
  const adminLogin = async (email, password) => {
    const res = await authAPI.adminLogin({ email, password });
    if (res.data?.success) {
      const { user: adminData, accessToken, refreshToken } = res.data.data;
      setAuthToken(accessToken);
      if (refreshToken) setRefreshToken(refreshToken);
      setUser(adminData);
      return adminData;
    }
    throw new Error(res.data?.message || 'Admin login failed');
  };

  // Register Customer
  const register = async (data) => {
    const res = await authAPI.register(data);
    if (res.data?.success) {
      const { user: userData, accessToken, refreshToken } = res.data.data;
      setAuthToken(accessToken);
      if (refreshToken) setRefreshToken(refreshToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  // Logout
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // Continue cleanup
    } finally {
      clearAuthTokens();
      setUser(null);
    }
  };

  // Update profile
  const updateProfile = async (data) => {
    const res = await authAPI.updateProfile(data);
    if (res.data?.success && res.data.data?.user) {
      setUser(res.data.data.user);
      return res.data.data.user;
    }
    throw new Error(res.data?.message || 'Update failed');
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    loading,
    login,
    adminLogin,
    register,
    logout,
    updateProfile,
    refreshUserProfile: checkAuth,
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

