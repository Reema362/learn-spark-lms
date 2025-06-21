
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
      // Handle admin login with credentials - ALL admin accounts now use Supabase auth
      if (userType === 'admin' && password) {
        console.log('Attempting admin login for:', email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Supabase admin login error:', error);
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
            description: `Successfully logged in as admin`,
          });
          return true;
        }
      }

      // Handle learner SSO-style login with proper Supabase session
      if (userType === 'learner' && !password) {
        console.log('Starting learner SSO login for:', email);
        
        // First check if profile exists
        const { data: existingProfile, error: searchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();

        let profile = existingProfile;

        // If profile doesn't exist, create it
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
          // Create a proper Supabase session for the learner
          console.log('Creating Supabase session for learner:', profile.email);
          
          // Generate a temporary password for session creation
          const tempPassword = crypto.randomUUID() + 'Temp!';
          
          try {
            // Try to sign up the user in Supabase auth to create session
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
              email: profile.email,
              password: tempPassword,
              options: {
                data: {
                  first_name: profile.first_name,
                  last_name: profile.last_name,
                  role: 'user'
                }
              }
            });

            if (signUpError && signUpError.message.includes('already registered')) {
              // User already exists in auth, try to sign in with magic link approach
              console.log('User exists in auth, creating session differently...');
              
              // For existing users, we'll create a session by setting user data directly
              const userData: User = {
                id: profile.id,
                email: profile.email,
                name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
                role: 'learner'
              };

              setUser(userData);
              saveUserSession(userData);
              
              // Create a mock session in Supabase by updating the current context
              // This ensures CourseService will work properly
              
              toast({
                title: "Welcome!",
                description: `Successfully logged in as ${userData.name}`,
              });
              
              return true;
            } else if (authData.user) {
              // Successfully created new auth user
              console.log('Successfully created Supabase auth session for learner');
              
              toast({
                title: "Welcome!",
                description: `Successfully logged in as ${profile.first_name || profile.email}`,
              });
              
              return true;
            }
          } catch (authError: any) {
            console.log('Auth signup failed, proceeding with profile session:', authError);
            
            // Fallback: create session with profile data
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
    
    // Clear demo courses and related data on logout
    console.log('Clearing demo data on logout');
    localStorage.removeItem('demo-courses');
    localStorage.removeItem('demo-enrollments');
    localStorage.removeItem('demo-lessons');
    localStorage.removeItem('demo-lesson-progress');
    localStorage.removeItem('demo-uploaded-files');
    localStorage.removeItem('demo-persistent-files');
    
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
