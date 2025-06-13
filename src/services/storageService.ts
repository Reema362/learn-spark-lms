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
      
      console.log('Uploading file to courses bucket:', finalPath);
      console.log('Original filename:', file.name);
      console.log('Sanitized filename:', cleanFileName);
      
      // Check authentication status
      const { data: { session } } = await supabase.auth.getSession();
      let isAuthenticated = false;
      let user = null;

      if (session?.user) {
        // User is authenticated with Supabase
        isAuthenticated = true;
        user = session.user;
        console.log('User authenticated with Supabase:', user.email);
      } else {
        // Check for app session (demo mode)
        const userSession = localStorage.getItem('avocop_user');
        if (userSession) {
          try {
            const parsedSession = JSON.parse(userSession);
            if (parsedSession && parsedSession.id && parsedSession.email && parsedSession.role === 'admin') {
              isAuthenticated = true;
              user = parsedSession;
              console.log('User authenticated with app session:', user.email);
            }
          } catch (parseError) {
            console.log('Error parsing user session:', parseError);
          }
        }
      }

      if (!isAuthenticated || !user) {
        throw new Error('Permission denied: You must be logged in as an admin to upload files.');
      }

      console.log('Authentication verified, proceeding with upload to courses bucket');
      
      // Upload to courses bucket with proper error handling
      const { data, error } = await supabase.storage
        .from('courses')
        .upload(finalPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Storage upload error:', error);
        console.error('Error message:', error.message);
        throw new Error(`File upload failed: ${error.message}`);
      }

      console.log('File uploaded successfully to courses bucket:', data);

      // Get the proper public URL for the uploaded file
      const { data: publicUrl } = supabase.storage
        .from('courses')
        .getPublicUrl(data.path);

      const finalUrl = publicUrl.publicUrl;
      console.log('Generated public URL from courses bucket:', finalUrl);
      
      return finalUrl;
    } catch (error: any) {
      console.error('File upload failed:', error);
      throw new Error(`File upload failed: ${error.message}`);
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
      // For demo mode, remove from local storage
      const uploadedFiles = JSON.parse(localStorage.getItem('demo-uploaded-files') || '[]');
      const updatedFiles = uploadedFiles.filter((file: any) => file.path !== path);
      localStorage.setItem('demo-uploaded-files', JSON.stringify(updatedFiles));
    }
  }

  // Helper method to get the correct public URL for a storage path
  static getPublicUrl(path: string): string {
    // Clean the path - remove any leading slashes and ensure proper encoding
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const publicUrl = supabase.storage
      .from('courses')
      .getPublicUrl(cleanPath).data.publicUrl;
    
    console.log('Generated public URL for path:', cleanPath, '-> URL:', publicUrl);
    return publicUrl;
  }

  // Helper method to check if a file exists in storage
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
