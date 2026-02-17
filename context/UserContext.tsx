import React, { createContext, useContext, useState, ReactNode } from 'react';
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
}

const DEFAULT_USER: UserState = {
  id: '',
  name: 'Guest',
  role: 'Manager',
  isAuthenticated: false,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // SECURITY: Removed localStorage persistence to prevent XSS attacks stealing session data.
  // In a production environment, use HttpOnly cookies with a backend for secure session management.
  const [user, setUser] = useState<UserState>(DEFAULT_USER);

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

  const updateRole = (role: UserRole) => {
    setUser(prev => ({ ...prev, role }));
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateRole }}>
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
