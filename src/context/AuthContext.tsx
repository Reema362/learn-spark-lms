
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
            // Clear any old app sessions when Supabase session is active
            localStorage.removeItem('avocop_user');
          }
        } else {
          // Only check app session if no Supabase session exists
          const appSession = loadUserSession();
          if (appSession) {
            setUser(appSession);
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
        // Fallback to app session
        const appSession = loadUserSession();
        if (appSession) {
          setUser(appSession);
        }
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
            // Clear any old app sessions when Supabase session is active
            localStorage.removeItem('avocop_user');
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

  const createOrUpdateAdminProfile = async (email: string, name: string) => {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (existingProfile) {
        // Update existing profile to admin
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('email', email)
          .select()
          .single();

        if (updateError) throw updateError;
        return updatedProfile;
      } else {
        // Create new admin profile
        const adminId = crypto.randomUUID();
        const [firstName, lastName] = name.split(' ');
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: adminId,
            email: email,
            first_name: firstName || name,
            last_name: lastName || '',
            role: 'admin'
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newProfile;
      }
    } catch (error) {
      console.error('Error creating/updating admin profile:', error);
      throw error;
    }
  };

  const login = async (email: string, password?: string, userType?: 'admin' | 'learner'): Promise<boolean> => {
    setLoading(true);
    
    try {
      // For admin login with predefined credentials
      if (userType === 'admin' && password) {
        const adminCredentials = [
          { email: 'naveen.v1@slksoftware.com', password: 'AdminPass2024!Strong', name: 'Naveen V' },
          { email: 'reema.jain@slksoftware.com', password: 'AdminPass2024!Strong', name: 'Reema Jain' }
        ];

        const adminUser = adminCredentials.find(admin => admin.email === email && admin.password === password);

        if (adminUser) {
          try {
            // Try to sign in with Supabase first
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password: 'TempPassword123!'
            });

            if (signInError && signInError.message.includes('Invalid login credentials')) {
              // User doesn't exist in Supabase, try to sign them up
              const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password: 'TempPassword123!',
                options: {
                  data: {
                    first_name: adminUser.name.split(' ')[0],
                    last_name: adminUser.name.split(' ')[1] || ''
                  }
                }
              });

              if (signUpError) {
                console.log('Supabase signup failed:', signUpError);
                throw new Error('Failed to create admin account in Supabase');
              }

              // Try to sign in again after signup
              const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password: 'TempPassword123!'
              });

              if (retryError) {
                throw new Error('Failed to sign in after account creation');
              }
            }

            // Create or update admin profile in database
            await createOrUpdateAdminProfile(adminUser.email, adminUser.name);

            toast({
              title: "Welcome back!",
              description: `Successfully logged in as ${adminUser.name}`,
            });
            
            return true;
          } catch (supabaseError: any) {
            console.error('Supabase login failed:', supabaseError);
            toast({
              title: "Login Failed",
              description: `Failed to authenticate with Supabase: ${supabaseError.message}`,
              variant: "destructive",
            });
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

      // For learner SSO-style login (no password required)
      if (userType === 'learner' && !password) {
        console.log('Starting learner SSO login for:', email);
        
        const { data: existingProfile, error: searchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();

        let profile = existingProfile;

        if (!existingProfile && searchError?.code === 'PGRST116') {
          console.log('No existing profile found, creating new learner profile');
          
          try {
            const userId = crypto.randomUUID();
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

            if (insertError) throw insertError;
            profile = newProfile;
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
        }
      }

      // Regular Supabase auth for backward compatibility
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
    
    // Try to sign out from Supabase
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
