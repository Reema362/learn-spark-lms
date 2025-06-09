
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, saveUserSession, loadUserSession, clearUserSession, logAuditEvent } from '../utils/sessionManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      try {
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
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
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
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        clearUserSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password?: string, userType?: 'admin' | 'learner'): Promise<boolean> => {
    setLoading(true);
    
    try {
      // For learner SSO-style login (no password required)
      if (userType === 'learner' && !password) {
        // Create or find learner profile
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();

        if (!profile) {
          // Create new learner profile
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: crypto.randomUUID(),
              email: email,
              first_name: email.split('@')[0],
              last_name: '',
              role: 'user'
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating learner profile:', insertError);
            toast({
              title: "Error",
              description: "Failed to create learner profile. Please try again.",
              variant: "destructive",
            });
            return false;
          }
          profile = newProfile;
        }

        if (profile) {
          // Create a session for the learner (simulated SSO)
          const userData: User = {
            id: profile.id,
            email: profile.email,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
            role: 'learner'
          };

          setUser(userData);
          saveUserSession(userData);
          logAuditEvent(`User ${userData.email} (learner) logged in via SSO`);
          
          toast({
            title: "Welcome back!",
            description: `Successfully logged in as ${userData.name}`,
          });
          
          return true;
        }
      }

      // For admin login - use hardcoded credentials for demo
      if (userType === 'admin' && password) {
        // Demo admin credentials
        const adminCredentials = [
          { email: 'naveen.v1@slksoftware.com', password: 'SecurePass123!', name: 'Naveen V' },
          { email: 'reema.jain@slksoftware.com', password: 'SecurePass123!', name: 'Reema Jain' }
        ];

        const adminUser = adminCredentials.find(admin => 
          admin.email === email && admin.password === password
        );

        if (adminUser) {
          // Create or update admin profile
          const { data: profile, error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: crypto.randomUUID(),
              email: adminUser.email,
              first_name: adminUser.name.split(' ')[0],
              last_name: adminUser.name.split(' ')[1] || '',
              role: 'admin'
            }, {
              onConflict: 'email'
            })
            .select()
            .single();

          if (upsertError) {
            console.error('Error creating/updating admin profile:', upsertError);
          }

          const userData: User = {
            id: profile?.id || crypto.randomUUID(),
            email: adminUser.email,
            name: adminUser.name,
            role: 'admin'
          };

          setUser(userData);
          saveUserSession(userData);
          logAuditEvent(`User ${userData.email} (admin) logged in`);
          
          toast({
            title: "Welcome back!",
            description: `Successfully logged in as ${userData.name}`,
          });
          
          return true;
        } else {
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please check your credentials.",
            variant: "destructive",
          });
          return false;
        }
      }

      // If no userType specified, try Supabase auth for backward compatibility
      if (password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Login error:', error);
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please check your credentials.",
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
      }

      toast({
        title: "Error",
        description: "Password is required for admin login",
        variant: "destructive",
      });
      return false;

    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
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
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
