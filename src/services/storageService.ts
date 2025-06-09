
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
      
      const { data, error } = await supabase.storage
        .from('courses')
        .upload(cleanPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Storage upload error:', error);
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
