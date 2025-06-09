
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, saveUserSession, loadUserSession, clearUserSession, logAuditEvent } from '../utils/sessionManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DatabaseService } from '@/services/database';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string, userType?: 'admin' | 'learner') => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  createAdminUsers: () => Promise<void>;
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
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const userData: User = {
            id: session.user.id,
            email: profile.email,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
            role: profile.role === 'admin' ? 'admin' : 'learner'
          };
          setUser(userData);
          saveUserSession(userData);
        }
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const userData: User = {
            id: session.user.id,
            email: profile.email,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
            role: profile.role === 'admin' ? 'admin' : 'learner'
          };
          setUser(userData);
          saveUserSession(userData);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        clearUserSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createAdminUsers = async () => {
    try {
      // Create admin users
      await DatabaseService.createAdminUser(
        'naveen.v1@slksoftware.com',
        'SecurePass123!',
        'Naveen',
        'V'
      );

      await DatabaseService.createAdminUser(
        'reema.jain@slksoftware.com',
        'SecurePass123!',
        'Reema',
        'Jain'
      );

      toast({
        title: "Admin users created",
        description: "Both admin users have been created successfully",
      });
    } catch (error: any) {
      console.error('Error creating admin users:', error);
      if (error.message?.includes('User already registered')) {
        toast({
          title: "Users already exist",
          description: "Admin users are already created",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create admin users",
          variant: "destructive",
        });
      }
    }
  };

  const login = async (email: string, password?: string, userType?: 'admin' | 'learner'): Promise<boolean> => {
    setLoading(true);
    
    try {
      if (!password) {
        // For learner SSO, create a demo login
        if (userType === 'learner') {
          // Check if user exists in profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

          if (!profile) {
            // Create a new learner user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email,
              password: 'TempPass123!',
              user_metadata: {
                first_name: email.split('@')[0],
                last_name: ''
              },
              email_confirm: true
            });

            if (authError) throw authError;

            if (authData.user) {
              const { error: profileError } = await supabase
                .from('profiles')
                .update({
                  role: 'user'
                })
                .eq('id', authData.user.id);

              if (profileError) throw profileError;
            }
          }

          // Sign in the user
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: 'TempPass123!',
          });

          if (error) throw error;

          toast({
            title: "Welcome!",
            description: "Successfully signed in via SSO",
          });
          
          return true;
        } else {
          toast({
            title: "Error",
            description: "Password is required for admin login",
            variant: "destructive",
          });
          return false;
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      if (data.user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          // Check if user type matches if specified
          if (userType && userType === 'admin' && profile.role !== 'admin') {
            await supabase.auth.signOut();
            toast({
              title: "Access Denied",
              description: "Admin access required",
              variant: "destructive",
            });
            return false;
          }

          const userData: User = {
            id: data.user.id,
            email: profile.email,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
            role: profile.role === 'admin' ? 'admin' : 'learner'
          };

          setUser(userData);
          saveUserSession(userData);
          logAuditEvent(`User ${userData.email} (${userData.role}) logged in`);
          
          toast({
            title: "Welcome back!",
            description: `Successfully logged in as ${userData.name}`,
          });
          
          return true;
        }
      }
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
    
    return false;
  };

  const logout = async () => {
    if (user) {
      logAuditEvent(`User ${user.email} (${user.role}) logged out`);
    }
    
    await supabase.auth.signOut();
    setUser(null);
    clearUserSession();
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, createAdminUsers }}>
      {children}
    </AuthContext.Provider>
  );
};
