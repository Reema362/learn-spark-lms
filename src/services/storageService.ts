
import { supabase } from '@/integrations/supabase/client';
import { sanitizeFileName, generateUniqueFileName } from '@/utils/fileUtils';

export class StorageService {
  static async uploadFile(file: File, path: string) {
    try {
      // First, verify we have an authenticated session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      
      if (!session || !session.user) {
        console.error('No authenticated session found');
        throw new Error('You must be logged in to upload files. Please log in and try again.');
      }
      
      console.log('Authenticated user for upload:', {
        id: session.user.id,
        email: session.user.email,
        role: session.user.user_metadata?.role || 'unknown'
      });
      
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
      console.log('Session access token present:', !!session.access_token);
      
      // Ensure the Supabase client is using the current session
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });
      
      // Upload to Supabase storage with explicit session context
      const { data, error } = await supabase.storage
        .from('courses')
        .upload(finalPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Storage upload error details:', {
          message: error.message,
          statusCode: error.statusCode,
          user: session.user.email,
          filePath: finalPath,
          fileSize: file.size,
          fileType: file.type
        });
        
        if (error.message.includes('row-level security policy')) {
          throw new Error(`Upload failed: Authentication issue. Please ensure you're logged in as an admin user and try again. (${error.message})`);
        }
        
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
      console.error('File upload failed with detailed error:', {
        message: error.message,
        stack: error.stack,
        fileName: file.name,
        fileSize: file.size,
        uploadPath: path
      });
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  static async deleteFile(path: string) {
    try {
      // Verify session before delete operation
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required for file deletion');
      }
      
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
