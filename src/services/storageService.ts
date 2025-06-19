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
      if (!isDemoMode) {
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
          console.log('Supabase upload failed, falling back to demo mode:', error);
          isDemoMode = true;
        }
      }
      
      // Demo mode or Supabase fallback
      if (isDemoMode) {
        console.log('Demo mode: Using persistent file storage');
        return this.handleDemoModeUpload(file, finalPath);
      } else {
        throw new Error(`File upload failed: ${error?.message || 'Unknown error'}`);
      }
      
    } catch (uploadError: any) {
      console.error('File upload failed:', uploadError);
      throw new Error(`File upload failed: ${uploadError.message}`);
    }
  }

  private static handleDemoModeUpload(file: File, finalPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log('Demo mode: Converting file to persistent base64 storage');
      
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const base64Data = reader.result as string;
          const demoUrl = `demo://${finalPath}`;
          
          // Store file persistently as base64 in localStorage
          const persistentFiles = JSON.parse(localStorage.getItem('demo-persistent-files') || '{}');
          persistentFiles[finalPath] = {
            data: base64Data,
            type: file.type,
            name: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            url: demoUrl
          };
          
          localStorage.setItem('demo-persistent-files', JSON.stringify(persistentFiles));
          
          // Also update the old demo-uploaded-files for backward compatibility
          const demoFiles = JSON.parse(localStorage.getItem('demo-uploaded-files') || '[]');
          const existingFileIndex = demoFiles.findIndex((f: any) => f.path === finalPath);
          
          const fileInfo = {
            path: finalPath,
            url: demoUrl,
            data: base64Data, // Store base64 data directly
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            size: file.size,
            type: file.type
          };
          
          if (existingFileIndex >= 0) {
            demoFiles[existingFileIndex] = fileInfo;
          } else {
            demoFiles.push(fileInfo);
          }
          
          localStorage.setItem('demo-uploaded-files', JSON.stringify(demoFiles));
          
          console.log('Demo file stored persistently:', demoUrl);
          resolve(demoUrl);
        } catch (error) {
          reject(new Error('Failed to process file for demo storage'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file for demo storage'));
      };
      
      reader.readAsDataURL(file);
    });
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
      const uploadedFiles = JSON.parse(localStorage.getItem('demo-uploaded-files') || '[]');
      const updatedFiles = uploadedFiles.filter((file: any) => file.path !== path);
      localStorage.setItem('demo-uploaded-files', JSON.stringify(updatedFiles));
      
      // Also remove from persistent storage
      const persistentFiles = JSON.parse(localStorage.getItem('demo-persistent-files') || '{}');
      delete persistentFiles[path];
      localStorage.setItem('demo-persistent-files', JSON.stringify(persistentFiles));
    }
  }

  // Helper method to get the correct public URL for a storage path
  static getPublicUrl(path: string): string {
    // Check if this is a demo mode URL
    if (path.startsWith('demo://')) {
      // Extract the path and find the file data
      const demoPath = path.replace('demo://', '');
      
      // Try persistent storage first
      const persistentFiles = JSON.parse(localStorage.getItem('demo-persistent-files') || '{}');
      if (persistentFiles[demoPath]) {
        console.log('Using persistent demo file:', demoPath);
        return persistentFiles[demoPath].data; // Return base64 data directly
      }
      
      // Fall back to old storage method
      const demoFiles = JSON.parse(localStorage.getItem('demo-uploaded-files') || '[]');
      const demoFile = demoFiles.find((file: any) => file.path === demoPath);
      
      if (demoFile && demoFile.data) {
        console.log('Using demo file data for:', demoPath);
        return demoFile.data; // Return base64 data directly
      }
      
      // Final fallback for old blob URLs (may not work after page refresh)
      if (demoFile && demoFile.blobUrl) {
        console.log('Using demo blob URL (may be temporary):', demoFile.blobUrl);
        return demoFile.blobUrl;
      }
      
      console.warn('Demo file not found:', demoPath);
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
    if (videoUrl.startsWith('demo://')) {
      return this.getPublicUrl(videoUrl);
    }
    
    // If it's a storage path, convert to public URL
    return this.getPublicUrl(videoUrl);
  }

  // Helper method to check if a file exists in storage
  static async fileExists(path: string): Promise<boolean> {
    try {
      // Check persistent demo storage first
      const persistentFiles = JSON.parse(localStorage.getItem('demo-persistent-files') || '{}');
      if (persistentFiles[path]) {
        return true;
      }
      
      // Check demo mode files
      const demoFiles = JSON.parse(localStorage.getItem('demo-uploaded-files') || '[]');
      if (demoFiles.some((file: any) => file.path === path)) {
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
