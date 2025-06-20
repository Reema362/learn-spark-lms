
import { supabase } from '@/integrations/supabase/client';
import { sanitizeFileName, generateUniqueFileName } from '@/utils/fileUtils';
import { DemoStorageService } from './demoStorageService';

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
      
      // Check authentication status - prioritize Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      let isAuthenticated = false;
      let user = null;
      let isDemoMode = false;

      if (session?.user) {
        // User is authenticated with Supabase - this is the preferred mode
        isAuthenticated = true;
        user = session.user;
        isDemoMode = false;
        console.log('User authenticated with Supabase:', user.email);
      } else {
        // Check for app session (demo mode) only if no Supabase session
        const userSession = localStorage.getItem('avocop_user');
        if (userSession) {
          try {
            const parsedSession = JSON.parse(userSession);
            if (parsedSession && parsedSession.id && parsedSession.email && parsedSession.role === 'admin') {
              isAuthenticated = true;
              user = parsedSession;
              isDemoMode = true;
              console.log('User authenticated with demo mode:', user.email);
            }
          } catch (parseError) {
            console.log('Error parsing user session:', parseError);
          }
        }
      }

      if (!isAuthenticated || !user) {
        throw new Error('Permission denied: You must be logged in as an admin to upload files.');
      }

      // For Supabase-authenticated users, always upload to Supabase storage
      if (!isDemoMode) {
        console.log('Uploading to Supabase courses bucket...');
        
        const { data, error } = await supabase.storage
          .from('courses')
          .upload(finalPath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.error('Supabase upload failed:', error);
          throw new Error(`Supabase upload failed: ${error.message || 'Unknown error'}`);
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
        // Demo mode fallback - only for users without Supabase session
        console.log('Demo mode: Using persistent file storage');
        return DemoStorageService.handleDemoModeUpload(file, finalPath);
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
      // For demo mode, remove from both storage locations
      DemoStorageService.deleteDemoFile(path);
    }
  }

  static async fileExists(path: string): Promise<boolean> {
    try {
      // Check demo mode files first
      if (DemoStorageService.demoFileExists(path)) {
        return true;
      }
      
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
