
import { supabase } from '@/integrations/supabase/client';

export class UserService {
  static async getUsers() {
    console.log('Fetching all users from profiles table...');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    console.log(`Successfully fetched ${data?.length || 0} users`);
    return data || [];
  }

  static async createUser(userData: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    role?: 'admin' | 'user';
    department?: string;
  }) {
    try {
      console.log('Creating user with data:', userData);
      
      // Create user in Supabase Auth first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            role: userData.role || 'user',
            department: userData.department || ''
          }
        }
      });

      if (authError) {
        console.error('Auth error creating user:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user in auth');
      }

      console.log('Auth user created successfully:', authData.user.id);

      // Wait for the trigger to create the profile, or create it manually if needed
      let retries = 5;
      let profile = null;
      
      while (retries > 0 && !profile) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
          
        if (existingProfile) {
          profile = existingProfile;
          console.log('Profile found via trigger:', profile);
          break;
        }
        
        retries--;
        console.log(`Profile not found, retrying... (${retries} attempts left)`);
      }

      // If profile wasn't created by trigger, create it manually
      if (!profile) {
        console.log('Creating profile manually for user:', authData.user.id);
        
        // Double-check that the auth user exists before creating profile
        const { data: authUser } = await supabase.auth.admin.getUserById(authData.user.id);
        
        if (!authUser.user) {
          throw new Error('Auth user not found, cannot create profile');
        }

        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: userData.email,
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            role: userData.role || 'user',
            department: userData.department || ''
          })
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Clean up auth user if profile creation fails
          try {
            await supabase.auth.admin.deleteUser(authData.user.id);
          } catch (cleanupError) {
            console.error('Failed to cleanup auth user:', cleanupError);
          }
          throw profileError;
        }
        profile = newProfile;
      }

      console.log('User created successfully:', profile);
      return profile;
    } catch (error: any) {
      console.error('Error in createUser:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  static async bulkCreateUsers(users: Array<{
    email: string;
    first_name?: string;
    last_name?: string;
    department?: string;
    role?: 'admin' | 'user';
  }>) {
    const results = [];
    let successCount = 0;
    
    console.log(`Starting bulk creation of ${users.length} users with 2-second delays`);
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`Processing user ${i + 1}/${users.length}: ${user.email}`);
      
      try {
        if (!user.email || !user.email.includes('@')) {
          throw new Error('Invalid email format');
        }

        // Generate a temporary password
        const tempPassword = Math.random().toString(36).slice(-8) + 'Temp123!';
        
        const result = await this.createUser({
          ...user,
          password: tempPassword,
          role: user.role || 'user'
        });
        
        successCount++;
        results.push({ 
          success: true, 
          user: result, 
          tempPassword,
          email: user.email 
        });
        
        console.log(`✓ Successfully created user: ${user.email}`);
      } catch (error: any) {
        console.error(`✗ Failed to create user ${user.email}:`, error);
        results.push({ 
          success: false, 
          error: error.message, 
          email: user.email 
        });
      }
      
      // Add 2-second delay between each user creation to avoid rate limits
      if (i < users.length - 1) {
        console.log(`Waiting 2 seconds before processing next user...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`Bulk creation completed: ${successCount} successful, ${results.length - successCount} failed`);
    return results;
  }

  static async retryFailedUsers(failedUsers: Array<{
    email: string;
    first_name?: string;
    last_name?: string;
    department?: string;
    role?: 'admin' | 'user';
  }>) {
    console.log(`Retrying ${failedUsers.length} failed users`);
    return await this.bulkCreateUsers(failedUsers);
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
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
