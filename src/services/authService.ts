
import { supabase } from '@/integrations/supabase/client';
import { CourseMigrationUtility } from '@/utils/courseMigration';

export class AuthService {
  static async loginWithSupabase(email: string, password: string) {
    try {
      console.log('Attempting Supabase login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // If user doesn't exist and it's a demo admin, create the account
        if (error.message.includes('Invalid login credentials') && 
            (email === 'naveen.v1@slksoftware.com' || email === 'reema.jain@slksoftware.com')) {
          
          console.log('Demo admin not found in Supabase, creating account...');
          const created = await CourseMigrationUtility.createAdminUserForDemo(email);
          
          if (created) {
            // Try logging in again with the temp password
            const retryResult = await supabase.auth.signInWithPassword({
              email,
              password: 'TempPassword123!'
            });
            
            if (retryResult.error) {
              throw retryResult.error;
            }
            
            return {
              user: retryResult.data.user,
              session: retryResult.data.session,
              needsPasswordChange: true
            };
          }
        }
        throw error;
      }

      console.log('Supabase login successful:', data.user?.email);
      
      // Clear any demo data since user is now authenticated with Supabase
      localStorage.removeItem('avocop_user');
      
      return {
        user: data.user,
        session: data.session,
        needsPasswordChange: false
      };
    } catch (error: any) {
      console.error('Supabase login failed:', error);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any local storage data
      localStorage.removeItem('avocop_user');
      localStorage.removeItem('supabase.auth.token');
      
      console.log('Logged out successfully');
    } catch (error: any) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  static async getCurrentUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch {
      return false;
    }
  }

  // Demo mode fallback (only for backwards compatibility)
  static loginDemoMode(email: string, password: string) {
    console.warn('Using demo mode - courses will not be globally accessible');
    
    const demoUsers = {
      'naveen.v1@slksoftware.com': { role: 'admin', name: 'Naveen V' },
      'reema.jain@slksoftware.com': { role: 'admin', name: 'Reema Jain' },
      'learner@example.com': { role: 'learner', name: 'Demo Learner' }
    };

    const user = demoUsers[email as keyof typeof demoUsers];
    
    if (user && password === 'admin123') {
      const userData = {
        id: crypto.randomUUID(),
        email,
        role: user.role,
        name: user.name,
        isDemo: true
      };
      
      localStorage.setItem('avocop_user', JSON.stringify(userData));
      return userData;
    }
    
    throw new Error('Invalid demo credentials');
  }
}
