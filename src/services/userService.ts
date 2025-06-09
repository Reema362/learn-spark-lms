
import { supabase } from '@/integrations/supabase/client';

export class UserService {
  static async getUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createUser(userData: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    role?: 'admin' | 'learner' | 'instructor';
    department?: string;
  }) {
    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      user_metadata: {
        first_name: userData.first_name,
        last_name: userData.last_name
      }
    });

    if (authError) throw authError;

    // Update profile with additional data
    if (authData.user && (userData.role || userData.department)) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: userData.role === 'learner' ? 'user' : userData.role === 'instructor' ? 'manager' : 'admin',
          department: userData.department
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;
    }

    return authData.user;
  }

  static async updateUser(id: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteUser(id: string) {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;
  }

  static async createAdminUser(email: string, password: string, firstName: string, lastName: string) {
    try {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          first_name: firstName,
          last_name: lastName
        },
        email_confirm: true
      });

      if (authError) throw authError;

      // Update profile to set admin role
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: 'admin',
            first_name: firstName,
            last_name: lastName
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;
      }

      return authData.user;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }
}
