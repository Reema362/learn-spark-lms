
import { supabase } from '@/integrations/supabase/client';
import { sanitizeFileName, generateUniqueFileName } from '@/utils/fileUtils';

export class StorageService {
  static async uploadFile(file: File, path: string) {
    try {
      // Generate a clean, unique filename
      const cleanFileName = generateUniqueFileName(file.name);
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      
      // Use the directory from path but replace filename with sanitized version
      const pathParts = cleanPath.split('/');
      pathParts[pathParts.length - 1] = cleanFileName;
      const finalPath = pathParts.join('/');
      
      console.log('Uploading file to Supabase courses bucket, path:', finalPath);
      console.log('Original filename:', file.name);
      console.log('Sanitized filename:', cleanFileName);
      
      // Upload to Supabase storage with the new clean policies
      const { data, error } = await supabase.storage
        .from('courses')
        .upload(finalPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`File upload failed: ${error.message}`);
      }

      console.log('File uploaded successfully to Supabase:', data);

      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('courses')
        .getPublicUrl(data.path);

      const finalUrl = publicUrlData.publicUrl;
      console.log('Generated public URL:', finalUrl);
      
      return finalUrl;
    } catch (error: any) {
      console.error('File upload failed:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  static async deleteFile(path: string) {
    try {
      const { error } = await supabase.storage
        .from('courses')
        .remove([path]);

      if (error) {
        console.error('Delete file error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  }

  // Helper method to get the correct public URL for a storage path
  static getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from('courses')
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  // Helper method to check if a file exists in storage
  static async fileExists(path: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from('courses')
        .list(path.substring(0, path.lastIndexOf('/')), {
          search: path.substring(path.lastIndexOf('/') + 1)
        });
      
      return !error && data && data.length > 0;
    } catch {
      return false;
    }
  }
}
