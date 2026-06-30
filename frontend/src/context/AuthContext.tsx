import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'business_owner' | 'super_admin';
  businessId: string | null;
  phone?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerOwner: (data: any) => Promise<void>;
  registerCustomer: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const getMe = useCallback(async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      const resData = await response.json();
      if (resData.success) {
        setUser(resData.data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, logout]);

  useEffect(() => {
    if (token) {
      getMe(token);
    } else {
      setIsLoading(false);
    }
  }, [token, getMe]);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const resData = await response.json();
    if (!resData.success) {
      throw new Error(resData.error?.message || 'Login failed');
    }

    const { token: authToken, user: loggedUser } = resData.data;
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(loggedUser);
  };

  const registerOwner = async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const resData = await response.json();
    if (!resData.success) {
      throw new Error(resData.error?.message || 'Registration failed');
    }

    const { token: authToken, user: registeredUser } = resData.data;
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(registeredUser);
  };

  const registerCustomer = async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const resData = await response.json();
    if (!resData.success) {
      throw new Error(resData.error?.message || 'Registration failed');
    }

    const { token: authToken, user: registeredUser } = resData.data;
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(registeredUser);
  };

  const isAuthenticated = !!user;
  const isOwner = user?.role === 'business_owner';
  const isAdmin = user?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      isOwner,
      isAdmin,
      isLoading,
      login,
      logout,
      registerOwner,
      registerCustomer
    }}>
      {children}
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
