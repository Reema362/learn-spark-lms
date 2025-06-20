
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
      
      // Check authentication status
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw new Error('Authentication error: Unable to verify session');
      }

      // Check if user is authenticated with Supabase
      if (session?.user) {
        console.log('User authenticated with Supabase:', session.user.email);
        
        // Verify admin role from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          throw new Error('Unable to verify admin privileges. Please contact support.');
        }

        if (!profile || profile.role !== 'admin') {
          console.error('User does not have admin role:', profile);
          throw new Error('Admin privileges required. You must be logged in as an administrator to upload files.');
        }

        console.log('Admin privileges verified for user:', session.user.email);
        console.log('Uploading to Supabase courses bucket...');
        
        const { data, error } = await supabase.storage
          .from('courses')
          .upload(finalPath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.error('Supabase upload failed:', error);
          throw new Error(`Upload failed: ${error.message}. Please ensure the storage bucket is properly configured.`);
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
        // No Supabase session - check for localStorage admin session
        console.log('No Supabase session found, checking localStorage for admin session');
        const userSession = localStorage.getItem('avocop_user');
        
        if (userSession) {
          let parsedSession;
          try {
            parsedSession = JSON.parse(userSession);
          } catch (parseError) {
            console.error('Error parsing user session:', parseError);
            throw new Error('Invalid session data. Please log out and log back in.');
          }
          
          if (parsedSession && parsedSession.role === 'admin') {
            console.log('Found admin session in localStorage for:', parsedSession.email);
            
            // For demo admin accounts, use localStorage-based file storage
            const { DemoStorageService } = await import('./demoStorageService');
            const demoUrl = await DemoStorageService.handleDemoModeUpload(file, finalPath);
            
            console.log('File uploaded successfully in demo mode:', demoUrl);
            return demoUrl;
          } else {
            throw new Error('Admin privileges required. Please log in as an administrator to upload files.');
          }
        } else {
          throw new Error('Authentication required: Please log in as an admin to upload files.');
        }
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
