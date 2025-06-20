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
          console.log('Found Supabase session for:', session.user.email);
          
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
            console.log('Setting user from Supabase profile:', userData);
            setUser(userData);
            saveUserSession(userData);
            // Clear any old app sessions when Supabase session is active
            localStorage.removeItem('avocop_user');
          }
        } else {
          console.log('No Supabase session found, checking localStorage');
          // Only check app session if no Supabase session exists
          const appSession = loadUserSession();
          if (appSession) {
            console.log('Found app session:', appSession);
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
      console.log('Auth state changed:', event, session?.user?.email);
      
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
            console.log('Auth state change - setting user:', userData);
            setUser(userData);
            saveUserSession(userData);
            // Clear any old app sessions when Supabase session is active
            localStorage.removeItem('avocop_user');
          }
        } catch (error) {
          console.error('Error fetching profile on auth change:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        clearUserSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password?: string, userType?: 'admin' | 'learner'): Promise<boolean> => {
    setLoading(true);
    
    try {
      // For admin login with credentials
      if (userType === 'admin' && password) {
        const adminCredentials = [
          { email: 'naveen.v1@slksoftware.com', password: 'AdminPass2024!Strong', name: 'Naveen V' },
          { email: 'reema.jain@slksoftware.com', password: 'AdminPass2024!Strong', name: 'Reema Jain' }
        ];

        const adminUser = adminCredentials.find(admin => admin.email === email && admin.password === password);

        if (adminUser) {
          try {
            console.log('Attempting Supabase admin login for:', adminUser.email);
            
            // Try direct Supabase login with the provided password first
            const { data: directSignIn, error: directError } = await supabase.auth.signInWithPassword({
              email,
              password
            });

            if (directSignIn?.user && !directError) {
              console.log('Direct Supabase login successful');
              
              // Verify admin role in profiles table
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', directSignIn.user.id)
                .single();

              if (profile && profile.role === 'admin') {
                toast({
                  title: "Welcome back!",
                  description: `Successfully logged in as ${adminUser.name}`,
                });
                return true;
              } else {
                // Update role to admin if user exists but isn't admin
                if (profile) {
                  await supabase
                    .from('profiles')
                    .update({ role: 'admin' })
                    .eq('id', directSignIn.user.id);
                  
                  toast({
                    title: "Welcome back!",
                    description: `Successfully logged in as ${adminUser.name}`,
                  });
                  return true;
                }
              }
            }

            // If direct login fails, try with temporary password
            if (directError && directError.message.includes('Invalid login credentials')) {
              console.log('Direct login failed, trying with temporary password');
              
              const { data: tempSignIn, error: tempError } = await supabase.auth.signInWithPassword({
                email,
                password: 'TempPassword123!'
              });

              if (tempSignIn?.user && !tempError) {
                console.log('Temporary password login successful');
                
                // Update or create admin profile
                const { data: existingProfile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', tempSignIn.user.id)
                  .single();

                if (existingProfile) {
                  await supabase
                    .from('profiles')
                    .update({ role: 'admin' })
                    .eq('id', tempSignIn.user.id);
                } else {
                  const [firstName, lastName] = adminUser.name.split(' ');
                  await supabase
                    .from('profiles')
                    .insert({
                      id: tempSignIn.user.id,
                      email: adminUser.email,
                      first_name: firstName || adminUser.name,
                      last_name: lastName || '',
                      role: 'admin'
                    });
                }

                toast({
                  title: "Welcome back!",
                  description: `Successfully logged in as ${adminUser.name}`,
                });
                return true;
              }
            }

            throw new Error('Authentication failed with both provided and temporary passwords');

          } catch (supabaseError: any) {
            console.error('Supabase login failed:', supabaseError);
            toast({
              title: "Login Failed",
              description: `Authentication failed: ${supabaseError.message}`,
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
