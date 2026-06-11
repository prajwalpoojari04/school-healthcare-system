import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { normalizeRole } from '../utils/helpers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);
      console.log('[AuthContext] restored session', {
        user: parsedUser,
        role: parsedUser?.role,
        normalizedRole: normalizeRole(parsedUser?.role),
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log('[AuthContext] state updated', {
      user,
      role: user?.role,
      normalizedRole: normalizeRole(user?.role),
      isAuthenticated: !!token,
      loading,
    });
  }, [user, token, loading]);

  const persistAuth = useCallback((response, rememberMe = false) => {
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('role', response.user.role);
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }
  }, []);

  const login = useCallback(async (credentials, rememberMe = false) => {
    const response = await authService.login(credentials);
    persistAuth(response, rememberMe);
    return response;
  }, [persistAuth]);

  const register = useCallback(async (userData) => {
    const response = await authService.register(userData);
    persistAuth(response);
    return response;
  }, [persistAuth]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('rememberMe');
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
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
