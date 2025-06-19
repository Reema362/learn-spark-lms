
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
      let isDemoMode = false;

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

      // Always try Supabase first for authenticated users
      console.log('Attempting Supabase upload to courses bucket');
      
      const { data, error } = await supabase.storage
        .from('courses')
        .upload(finalPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (!error && data) {
        console.log('File uploaded successfully to courses bucket:', data);

        const { data: publicUrl } = supabase.storage
          .from('courses')
          .getPublicUrl(data.path);

        const finalUrl = publicUrl.publicUrl;
        console.log('Generated public URL from courses bucket:', finalUrl);
        
        return finalUrl;
      } else {
        console.log('Supabase upload failed, error:', error);
        
        // Only fall back to demo mode if user is in demo mode
        if (isDemoMode) {
          console.log('Demo mode: Falling back to persistent demo storage');
          return this.handlePersistentDemoUpload(file, finalPath, user);
        } else {
          throw new Error(`File upload failed: ${error?.message || 'Unknown error'}`);
        }
      }
      
    } catch (error: any) {
      console.error('File upload failed:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  private static handlePersistentDemoUpload(file: File, finalPath: string, user: any): string {
    console.log('Demo mode: Creating persistent file reference');
    
    // Create a persistent demo URL that references the file path
    const demoUrl = `demo-persistent://${finalPath}`;
    
    // Convert file to base64 for persistent storage
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        
        // Store demo file info with base64 data for persistence
        const demoFiles = JSON.parse(localStorage.getItem(`demo-uploaded-files-${user.id}`) || '[]');
        const demoFile = {
          path: finalPath,
          url: demoUrl,
          base64Data: base64Data,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          size: file.size,
          type: file.type,
          userId: user.id
        };
        
        // Remove any existing file with the same path
        const updatedFiles = demoFiles.filter((f: any) => f.path !== finalPath);
        updatedFiles.push(demoFile);
        
        localStorage.setItem(`demo-uploaded-files-${user.id}`, JSON.stringify(updatedFiles));
        
        console.log('Demo file upload with persistence:', demoUrl);
        resolve(demoUrl);
      };
      reader.onerror = () => reject(new Error('Failed to read file for demo storage'));
      reader.readAsDataURL(file);
    }) as any;
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
      // For demo mode, remove from user-specific storage
      const userSession = localStorage.getItem('avocop_user');
      if (userSession) {
        const user = JSON.parse(userSession);
        const uploadedFiles = JSON.parse(localStorage.getItem(`demo-uploaded-files-${user.id}`) || '[]');
        const updatedFiles = uploadedFiles.filter((file: any) => file.path !== path);
        localStorage.setItem(`demo-uploaded-files-${user.id}`, JSON.stringify(updatedFiles));
      }
    }
  }

  // Helper method to get the correct public URL for a storage path
  static getPublicUrl(path: string): string {
    // Check if this is a demo mode URL
    if (path.startsWith('demo://') || path.startsWith('demo-persistent://')) {
      // For persistent demo URLs, get the base64 data
      const userSession = localStorage.getItem('avocop_user');
      if (userSession) {
        const user = JSON.parse(userSession);
        const demoPath = path.replace(/^demo(-persistent)?:\/\//, '');
        const demoFiles = JSON.parse(localStorage.getItem(`demo-uploaded-files-${user.id}`) || '[]');
        const demoFile = demoFiles.find((file: any) => file.path === demoPath);
        
        if (demoFile) {
          if (demoFile.base64Data) {
            console.log('Using persistent demo base64 data for video playback');
            return demoFile.base64Data;
          } else if (demoFile.blobUrl) {
            console.log('Using demo blob URL for video playback:', demoFile.blobUrl);
            return demoFile.blobUrl;
          }
        }
      }
      
      // Fallback for demo URLs without data
      return path;
    }
    
    // Clean the path - remove any leading slashes and ensure proper encoding
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const publicUrl = supabase.storage
      .from('courses')
      .getPublicUrl(cleanPath).data.publicUrl;
    
    console.log('Generated public URL for path:', cleanPath, '-> URL:', publicUrl);
    return publicUrl;
  }

  // Helper method to get public video URL specifically for admin video player
  static getPublicVideoUrl(videoUrl: string): string {
    if (!videoUrl) return '';
    
    // If it's already a full URL (http/https), return as is
    if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
      return videoUrl;
    }
    
    // If it's a demo URL, handle it
    if (videoUrl.startsWith('demo://') || videoUrl.startsWith('demo-persistent://')) {
      return this.getPublicUrl(videoUrl);
    }
    
    // If it's a storage path, convert to public URL
    return this.getPublicUrl(videoUrl);
  }

  // Helper method to check if a file exists in storage
  static async fileExists(path: string): Promise<boolean> {
    try {
      // Check demo mode first
      const userSession = localStorage.getItem('avocop_user');
      if (userSession) {
        const user = JSON.parse(userSession);
        const demoFiles = JSON.parse(localStorage.getItem(`demo-uploaded-files-${user.id}`) || '[]');
        if (demoFiles.some((file: any) => file.path === path)) {
          return true;
        }
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
