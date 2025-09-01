import { useState, useCallback } from 'react';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  isVerified: boolean;
}

let globalUser: User | null = null;
let globalIsAuthenticated = false;

export const useAuthStore = () => {
  const [user, setUser] = useState<User | null>(globalUser);
  const [isAuthenticated, setIsAuthenticated] = useState(globalIsAuthenticated);
  
  const login = useCallback((userData: User) => {
    globalUser = userData;
    globalIsAuthenticated = true;
    setUser(userData);
    setIsAuthenticated(true);
  }, []);
  
  const logout = useCallback(() => {
    globalUser = null;
    globalIsAuthenticated = false;
    setUser(null);
    setIsAuthenticated(false);
  }, []);
  
  const updateUser = useCallback((userData: Partial<User>) => {
    if (globalUser) {
      globalUser = { ...globalUser, ...userData };
      setUser(globalUser);
    }
  }, []);
  
  return {
    user,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };
};
