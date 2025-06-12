
import { supabase } from '@/integrations/supabase/client';

export class StorageService {
  static async uploadFile(file: File, path: string) {
    try {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      
      console.log('Uploading file to path:', cleanPath);
      console.log('File details:', { name: file.name, size: file.size, type: file.type });
      
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

      console.log('Authentication verified, proceeding with upload');
      
      // For Supabase authenticated users, try actual upload
      if (session?.user) {
        const { data, error } = await supabase.storage
          .from('courses')
          .upload(cleanPath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.error('Storage upload error:', error);
          throw new Error(`File upload failed: ${error.message}`);
        }

        console.log('File uploaded successfully to Supabase:', data);

        // Get the proper public URL for the uploaded file
        const { data: publicUrl } = supabase.storage
          .from('courses')
          .getPublicUrl(data.path);

        console.log('Generated public URL:', publicUrl.publicUrl);
        return publicUrl.publicUrl;
      } else {
        // For app session users (demo mode), create mock URL with proper structure
        console.log('Using demo mode upload for app session user');
        const mockUrl = `https://gfwnftqkzkjxujrznhww.supabase.co/storage/v1/object/public/courses/${cleanPath}`;
        console.log('Using mock URL:', mockUrl);
        
        // Store file reference in local state for demo purposes
        const uploadedFiles = JSON.parse(localStorage.getItem('demo-uploaded-files') || '[]');
        uploadedFiles.push({
          path: cleanPath,
          url: mockUrl,
          fileName: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user.email
        });
        localStorage.setItem('demo-uploaded-files', JSON.stringify(uploadedFiles));
        
        return mockUrl;
      }
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
    return supabase.storage
      .from('courses')
      .getPublicUrl(path).data.publicUrl;
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
