import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as loginApi } from '../api/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('gms_token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('gms_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [role, setRole] = useState(() => {
    const stored = localStorage.getItem('gms_user');
    if (!stored) return null;
    return JSON.parse(stored).role || null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('gms_token', token);
    } else {
      localStorage.removeItem('gms_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('gms_user', JSON.stringify(user));
      setRole(user.role || null);
    } else {
      localStorage.removeItem('gms_user');
      setRole(null);
    }
  }, [user]);

  // Real-time synchronization
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.addEventListener('profile_updated', (e) => {
      try {
        const { userId: updatedId, user: updatedUser } = JSON.parse(e.data);
        const currentUserId = user?.userId || user?.id;

        if (updatedId === currentUserId) {
          console.log("Real-time profile sync triggered");
          updateUser({
            name: updatedUser.name,
            image: updatedUser.image || updatedUser.imageUrl
          });
        }
      } catch (err) {
        console.error("SSE parse error", err);
      }
    });

    return () => eventSource.close();
  }, [user?.userId, user?.id]);

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const result = await loginApi({ email, password });
      const apiToken = result?.token;
      const apiUser = result?.user;

      if (!apiToken || !apiUser) {
        return { success: false, error: 'Invalid response from server' };
      }

      setToken(apiToken);
      setUser(apiUser);

      return { success: true, user: apiUser };
    } catch (error) {
      console.error('Login failed', error);
      const message = error?.message || 'Login failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const updateUser = (newData) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...newData };
    });
  };

  const value = {
    token,
    role,
    user,
    loading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

