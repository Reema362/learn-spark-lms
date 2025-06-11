
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

      // For admin login - use demo authentication for now
      if (userType === 'admin' && password) {
        // Demo admin credentials
        const adminCredentials = [
          { email: 'naveen.v1@slksoftware.com', password: 'AdminPass2024!Strong', name: 'Naveen V', id: 'admin-1' },
          { email: 'reema.jain@slksoftware.com', password: 'AdminPass2024!Strong', name: 'Reema Jain', id: 'admin-2' }
        ];

        const adminUser = adminCredentials.find(admin => admin.email === email && admin.password === password);

        if (adminUser) {
          console.log('Valid admin credentials, creating session for:', email);
          
          // Create admin session without Supabase auth for now
          const userData: User = {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            role: 'admin'
          };

          setUser(userData);
          saveUserSession(userData);
          logAuditEvent(`User ${userData.email} (admin) logged in`);
          
          toast({
            title: "Welcome back!",
            description: `Successfully logged in as ${adminUser.name}`,
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
    
    // Only try to sign out from Supabase if user is authenticated there
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.log('No Supabase session to sign out from');
    }
    
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
