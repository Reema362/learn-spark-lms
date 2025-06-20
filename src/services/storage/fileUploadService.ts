
import { supabase } from '@/integrations/supabase/client';
import { sanitizeFileName, generateUniqueFileName } from '@/utils/fileUtils';

export class FileUploadService {
  static async uploadFile(file: File, path: string) {
    try {
      // Generate a clean, unique filename
      const cleanFileName = generateUniqueFileName(file.name);
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      
      // Use the directory from path but replace filename with sanitized version
      const pathParts = cleanPath.split('/');
      pathParts[pathParts.length - 1] = cleanFileName;
      const finalPath = pathParts.join('/');
      
      console.log('Uploading file to courses bucket:', finalPath);
      console.log('Original filename:', file.name);
      console.log('Sanitized filename:', cleanFileName);
      
      // Check Supabase authentication status first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw new Error('Authentication error: Unable to verify session');
      }

      if (session?.user) {
        // User is authenticated with Supabase - upload to Supabase storage
        console.log('User authenticated with Supabase:', session.user.email);
        console.log('Uploading to Supabase courses bucket...');
        
        const { data, error } = await supabase.storage
          .from('courses')
          .upload(finalPath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.error('Supabase upload failed:', error);
          throw new Error(`Upload failed: ${error.message}. Please ensure you're logged in as an admin and the storage bucket is properly configured.`);
        }

        if (data) {
          console.log('File uploaded successfully to courses bucket:', data);

          const { data: publicUrlData } = supabase.storage
            .from('courses')
            .getPublicUrl(data.path);

          const finalUrl = publicUrlData.publicUrl;
          console.log('Generated public URL from courses bucket:', finalUrl);
          
          return finalUrl;
        } else {
          throw new Error('Upload failed: No data returned from Supabase storage');
        }
      } else {
        // No Supabase session - check for admin credentials in localStorage as fallback
        const userSession = localStorage.getItem('avocop_user');
        if (userSession) {
          try {
            const parsedSession = JSON.parse(userSession);
            if (parsedSession && parsedSession.role === 'admin') {
              console.warn('Demo mode: User not authenticated with Supabase but has admin session');
              throw new Error('Please log out and log back in with your admin credentials to upload files to persistent storage.');
            }
          } catch (parseError) {
            console.log('Error parsing user session:', parseError);
          }
        }
        
        throw new Error('Authentication required: Please log in as an admin to upload files.');
      }
      
    } catch (uploadError: any) {
      console.error('File upload failed:', uploadError);
      throw new Error(`File upload failed: ${uploadError.message}`);
    }
  }

  static async deleteFile(path: string) {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { error } = await supabase.storage
        .from('courses')
        .remove([path]);

      if (error) throw error;
    } else {
      throw new Error('Authentication required to delete files');
    }
  }

  static async fileExists(path: string): Promise<boolean> {
    try {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      const pathParts = cleanPath.split('/');
      const fileName = pathParts.pop();
      const folderPath = pathParts.join('/') || '/';

      const { data, error } = await supabase.storage
        .from('courses')
        .list(folderPath === '/' ? '' : folderPath, {
          search: fileName
        });
      
      return !error && data && data.length > 0;
    } catch {
      return false;
    }
  }
}
