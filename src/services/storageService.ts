
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
      
      // First, try to upload the file
      const { data, error } = await supabase.storage
        .from('courses')
        .upload(cleanPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Storage upload error:', error);
        // If it's an RLS error, provide more helpful info
        if (error.message.includes('row-level security')) {
          throw new Error('Permission denied: Admin access required for file uploads. Please ensure you are logged in as an admin user.');
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
      if (error.message.includes('Permission denied')) {
        throw error; // Re-throw our custom permission error
      }
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
