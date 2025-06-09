
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, saveUserSession, loadUserSession, clearUserSession, logAuditEvent } from '../utils/sessionManager';
import { authenticateUser } from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string, userType?: 'admin' | 'learner') => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

  useEffect(() => {
    // Check for existing session with validation
    const existingUser = loadUserSession();
    if (existingUser) {
      setUser(existingUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string, userType?: 'admin' | 'learner'): Promise<boolean> => {
    setLoading(true);
    
    const result = await authenticateUser(email, password, userType);
    
    if (result.success && result.user) {
      setUser(result.user);
      saveUserSession(result.user);
      
      // Audit logging (in production, send to secure logging service)
      logAuditEvent(`User ${result.user.email} (${result.user.role}) logged in`);
    }
    
    setLoading(false);
    return result.success;
  };

  const logout = () => {
    if (user) {
      // Audit logging
      logAuditEvent(`User ${user.email} (${user.role}) logged out`);
    }
    
    setUser(null);
    clearUserSession();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};
