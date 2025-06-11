
import { supabase } from '@/integrations/supabase/client';

export class StorageService {
  static async initializeStorage() {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'courses');
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket('courses', {
          public: true
        });
        if (error) {
          console.log('Bucket creation info:', error.message);
        }
      }
    } catch (error) {
      console.log('Storage initialization info:', error);
    }
  }

  static async uploadFile(file: File, path: string) {
    try {
      await this.initializeStorage();
      
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      
      console.log('Uploading file to path:', cleanPath);
      console.log('File details:', { name: file.name, size: file.size, type: file.type });
      
      // Check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Current authenticated user:', user);
      console.log('User error:', userError);
      
      if (!user) {
        throw new Error('Permission denied: You must be logged in to upload files.');
      }

      // Get user profile to check admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      console.log('User profile:', profile);
      console.log('Profile error:', profileError);

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // If we can't fetch the profile but user is authenticated, allow upload
        // This handles the case where admin profiles might not exist yet
        console.log('Proceeding with upload despite profile error - user is authenticated');
      } else if (profile && profile.role !== 'admin') {
        throw new Error('Permission denied: Admin access required for file uploads. Please ensure you are logged in as an admin user.');
      }

      console.log('User authenticated, proceeding with upload');
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('courses')
        .upload(cleanPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Storage upload error:', error);
        // If it's an RLS error, provide more helpful info
        if (error.message.includes('row-level security') || error.message.includes('RLS')) {
          throw new Error('Permission denied: Database security policy blocked the upload. Please ensure you are logged in as an admin user and try again.');
        }
        throw error;
      }

      console.log('File uploaded successfully:', data);

      const { data: publicUrl } = supabase.storage
        .from('courses')
        .getPublicUrl(data.path);

      return publicUrl.publicUrl;
    } catch (error: any) {
      console.error('File upload failed:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  static async deleteFile(path: string) {
    const { error } = await supabase.storage
      .from('courses')
      .remove([path]);

    if (error) throw error;
  }
}
