
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '../types';

interface UserState {
  id: string;
  name: string;
  role: UserRole;
  isAuthenticated: boolean;
  avatar?: string; // Prepared for future usage
}

interface UserContextType {
  user: UserState;
  login: (role: UserRole, name: string) => void;
  logout: () => void;
  updateRole: (role: UserRole) => void;
  updateUser: (updates: Partial<Pick<UserState, 'name' | 'role' | 'avatar'>>) => void;
}

const DEFAULT_USER: UserState = {
  id: '',
  name: 'Guest',
  role: 'Manager',
  isAuthenticated: false,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage to ensure persistence across reloads
  const [user, setUser] = useState<UserState>(() => {
    try {
      const stored = window.localStorage.getItem('jg_user_context');
      return stored ? JSON.parse(stored) : DEFAULT_USER;
    } catch (e) {
      console.warn("Failed to load user context", e);
      return DEFAULT_USER;
    }
  });

  // Persist state changes
  useEffect(() => {
    window.localStorage.setItem('jg_user_context', JSON.stringify(user));
  }, [user]);

  const login = (role: UserRole, name: string) => {
    setUser({
      id: Date.now().toString(),
      name,
      role,
      isAuthenticated: true,
      avatar: undefined // Future implementation
    });
  };

  const logout = () => {
    setUser(DEFAULT_USER);
  };

  const updateUser = (updates: Partial<Pick<UserState, 'name' | 'role' | 'avatar'>>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const updateRole = (role: UserRole) => {
    updateUser({ role });
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateRole, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
