
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

// Input sanitization helper
const sanitizeInput = (input: string): string => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/[<>]/g, '')
              .trim();
};

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const isRateLimited = (email: string): boolean => {
  const attempt = loginAttempts.get(email);
  if (!attempt) return false;
  
  const now = Date.now();
  if (now - attempt.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(email);
    return false;
  }
  
  return attempt.count >= MAX_LOGIN_ATTEMPTS;
};

const recordLoginAttempt = (email: string, success: boolean): void => {
  const now = Date.now();
  const attempt = loginAttempts.get(email) || { count: 0, lastAttempt: now };
  
  if (success) {
    loginAttempts.delete(email);
  } else {
    attempt.count += 1;
    attempt.lastAttempt = now;
    loginAttempts.set(email, attempt);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

  useEffect(() => {
    // Check for existing session with validation
    const savedUser = localStorage.getItem('avocop_user');
    const sessionTimestamp = localStorage.getItem('avocop_session_timestamp');
    
    if (savedUser && sessionTimestamp) {
      const sessionAge = Date.now() - parseInt(sessionTimestamp);
      const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
      
      if (sessionAge < SESSION_TIMEOUT) {
        try {
          const parsedUser = JSON.parse(savedUser);
          // Validate user object structure
          if (parsedUser.id && parsedUser.email && parsedUser.role) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem('avocop_user');
            localStorage.removeItem('avocop_session_timestamp');
          }
        } catch (error) {
          localStorage.removeItem('avocop_user');
          localStorage.removeItem('avocop_session_timestamp');
        }
      } else {
        // Session expired
        localStorage.removeItem('avocop_user');
        localStorage.removeItem('avocop_session_timestamp');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string, userType?: 'admin' | 'learner'): Promise<boolean> => {
    setLoading(true);
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    
    // Rate limiting check
    if (isRateLimited(sanitizedEmail)) {
      console.warn('Too many login attempts. Please try again later.');
      setLoading(false);
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      recordLoginAttempt(sanitizedEmail, false);
      setLoading(false);
      return false;
    }
    
    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let mockUser: User;
      let authSuccess = false;
      
      if (userType === 'admin' && password) {
        // Demo admin credentials
        if (sanitizedEmail === 'admin@avocop.com' && password === 'admin123') {
          mockUser = {
            id: '1',
            email: sanitizedEmail,
            name: 'Demo Admin',
            role: 'admin'
          };
          authSuccess = true;
        } else {
          recordLoginAttempt(sanitizedEmail, false);
          setLoading(false);
          return false;
        }
      } else if (userType === 'learner') {
        // Simulate SSO validation - in production, this would validate with SSO provider
        mockUser = {
          id: Math.random().toString(36).substr(2, 9),
          email: sanitizedEmail,
          name: sanitizedEmail.split('@')[0],
          role: 'learner',
          department: 'IT Security'
        };
        authSuccess = true;
      } else {
        recordLoginAttempt(sanitizedEmail, false);
        setLoading(false);
        return false;
      }
      
      if (authSuccess) {
        recordLoginAttempt(sanitizedEmail, true);
        setUser(mockUser);
        localStorage.setItem('avocop_user', JSON.stringify(mockUser));
        localStorage.setItem('avocop_session_timestamp', Date.now().toString());
        
        // Audit logging (in production, send to secure logging service)
        console.log(`Audit: User ${mockUser.email} (${mockUser.role}) logged in at ${new Date().toISOString()}`);
      }
      
      setLoading(false);
      return authSuccess;
    } catch (error) {
      recordLoginAttempt(sanitizedEmail, false);
      console.error('Authentication error:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    if (user) {
      // Audit logging
      console.log(`Audit: User ${user.email} (${user.role}) logged out at ${new Date().toISOString()}`);
    }
    
    setUser(null);
    localStorage.removeItem('avocop_user');
    localStorage.removeItem('avocop_session_timestamp');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};
