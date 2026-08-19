'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api, setToken, clearToken, onUnauthorized, User } from './api';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.auth.me();
      if (res?.data) {
        setUser(res.data);
        localStorage.setItem('fms_user', JSON.stringify(res.data));
      }
    } catch {
      // If token expired or unauthorized, clear
      handleLogout();
    }
  }, [handleLogout]);

  useEffect(() => {
    // Restore session from localStorage
    const stored = typeof window !== 'undefined' ? localStorage.getItem('fms_user') : null;
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('fms_token') : null;
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    // Listen for unauthorized 401 events from API client
    const unsubscribe = onUnauthorized(() => {
      handleLogout();
    });

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fms_token' && !e.newValue) {
        handleLogout();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, [handleLogout]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.auth.login(username, password);
    setToken(res.data.token);
    localStorage.setItem('fms_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    api.auth.logout().catch(() => {});
    handleLogout();
  }, [handleLogout]);

  return <Ctx.Provider value={{ user, loading, login, logout, refreshUser }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
