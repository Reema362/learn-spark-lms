
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'learner';
  department?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string, userType?: 'admin' | 'learner') => Promise<boolean>;
  logout: () => void;
  loading: boolean;
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

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('avocop_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string, userType?: 'admin' | 'learner'): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let mockUser: User;
      
      if (userType === 'admin' && password) {
        // Admin login with email and password
        if (email === 'admin@avocop.com' && password === 'admin123') {
          mockUser = {
            id: '1',
            email: email,
            name: 'Admin User',
            role: 'admin'
          };
        } else {
          setLoading(false);
          return false;
        }
      } else if (userType === 'learner') {
        // Learner SSO login (email only)
        mockUser = {
          id: '2',
          email: email,
          name: email.split('@')[0],
          role: 'learner',
          department: 'IT Security'
        };
      } else {
        setLoading(false);
        return false;
      }
      
      setUser(mockUser);
      localStorage.setItem('avocop_user', JSON.stringify(mockUser));
      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('avocop_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
