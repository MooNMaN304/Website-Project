'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setAuthCookie, removeAuthCookie } from 'lib/auth-cookies';

type AuthContextType = {
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Инициализация состояния при загрузке
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);

    // Sync existing token to cookies
    if (token) {
      setAuthCookie(token);
    }

    // Слушаем изменения в localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'authToken') {
        setIsLoggedIn(!!event.newValue);
      }
    };

    // Подписываемся на события storage
    window.addEventListener('storage', handleStorageChange);

    // Отписываемся при размонтировании
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (token: string) => {
    localStorage.setItem('authToken', token);
    setIsLoggedIn(true);
    // Also set the cookie for server-side access
    setAuthCookie(token);
    // Создаем событие для синхронизации с другими вкладками
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'authToken',
      newValue: token
    }));
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    // Also remove the cookie
    removeAuthCookie();
    // Создаем событие для синхронизации с другими вкладками
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'authToken',
      newValue: null
    }));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
