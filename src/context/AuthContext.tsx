
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

  const signInAdmin = async (email: string, password: string) => {
    try {
      console.log('Attempting admin sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      if (data.user) {
        console.log('Admin signed in successfully');
        return data.user;
      }

      throw new Error('No user returned from sign in');
    } catch (error: any) {
      console.error('Error in signInAdmin:', error);
      throw error;
    }
  };

  const createLearnerProfile = async (userId: string, email: string) => {
    try {
      console.log('Creating learner profile for:', email);
      
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          first_name: email.split('@')[0],
          last_name: '',
          role: 'user'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating learner profile:', insertError);
        
        // Handle specific constraint violations
        if (insertError.code === '23505') {
          throw new Error('A profile with this email already exists');
        } else if (insertError.code === '23503') {
          throw new Error('Invalid user reference. Please try logging in again.');
        } else {
          throw new Error(`Failed to create profile: ${insertError.message}`);
        }
      }

      console.log('Learner profile created successfully:', newProfile);
      return newProfile;
    } catch (error) {
      console.error('Error in createLearnerProfile:', error);
      throw error;
    }
  };

  const login = async (email: string, password?: string, userType?: 'admin' | 'learner'): Promise<boolean> => {
    setLoading(true);
    
    try {
      // For learner SSO-style login (no password required)
      if (userType === 'learner' && !password) {
        console.log('Starting learner SSO login for:', email);
        
        // First, check if learner profile already exists
        const { data: existingProfile, error: searchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();

        let profile = existingProfile;

        // If profile doesn't exist, create one
        if (!existingProfile && searchError?.code === 'PGRST116') {
          console.log('No existing profile found, creating new learner profile');
          
          try {
            // Generate a unique user ID for the profile
            const userId = crypto.randomUUID();
            profile = await createLearnerProfile(userId, email);
          } catch (createError: any) {
            console.error('Failed to create learner profile:', createError);
            toast({
              title: "Profile Creation Failed",
              description: createError.message || "Failed to create learner profile. Please try again.",
              variant: "destructive",
            });
            return false;
          }
        } else if (searchError && searchError.code !== 'PGRST116') {
          console.error('Error searching for profile:', searchError);
          toast({
            title: "Database Error",
            description: "Failed to check existing profile. Please try again.",
            variant: "destructive",
          });
          return false;
        }

        if (profile) {
          console.log('Profile found/created, creating session for:', profile.email);
          
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
            title: "Welcome!",
            description: `Successfully logged in as ${userData.name}`,
          });
          
          return true;
        } else {
          toast({
            title: "Login Failed",
            description: "Failed to create or retrieve learner profile.",
            variant: "destructive",
          });
          return false;
        }
      }

      // For admin login - use proper Supabase authentication
      if (userType === 'admin' && password) {
        // Updated demo admin credentials with stronger passwords
        const adminCredentials = [
          { email: 'naveen.v1@slksoftware.com', password: 'AdminPass2024!Strong', name: 'Naveen V' },
          { email: 'reema.jain@slksoftware.com', password: 'AdminPass2024!Strong', name: 'Reema Jain' }
        ];

        const adminUser = adminCredentials.find(admin => admin.email === email);

        if (adminUser && password === adminUser.password) {
          try {
            console.log('Valid admin credentials, authenticating with Supabase for:', email);
            
            // Use real Supabase authentication for admin - only sign in
            const authenticatedUser = await signInAdmin(adminUser.email, adminUser.password);

            if (authenticatedUser) {
              // The auth state change listener will handle setting the user state
              toast({
                title: "Welcome back!",
                description: `Successfully logged in as ${adminUser.name}`,
              });
              
              logAuditEvent(`User ${adminUser.email} (admin) logged in`);
              return true;
            }
          } catch (authError: any) {
            console.error('Error authenticating admin:', authError);
            
            // Handle specific authentication errors
            if (authError.message.includes('Invalid login credentials')) {
              toast({
                title: "Authentication Failed",
                description: "Invalid email or password. Please check your credentials and try again.",
                variant: "destructive",
              });
            } else if (authError.message.includes('Password is known to be weak')) {
              toast({
                title: "Password Update Required",
                description: "The default password is too weak. Please use the stronger password: AdminPass2024!Strong",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Authentication Failed",
                description: authError.message || "Failed to authenticate admin user. Please try again.",
                variant: "destructive",
              });
            }
            return false;
          }
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
          
          // Handle specific password strength error
          if (error.message.includes('Password is known to be weak')) {
            toast({
              title: "Password Update Required",
              description: "Please use a stronger password: AdminPass2024!Strong",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login Failed",
              description: "Invalid email or password. Please check your credentials.",
              variant: "destructive",
            });
          }
          return false;
        }

        if (data.user) {
          // The auth state change listener will handle setting the user state
          toast({
            title: "Welcome back!",
            description: `Successfully logged in`,
          });
          
          return true;
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
        description: error.message || "An unexpected error occurred. Please try again.",
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
