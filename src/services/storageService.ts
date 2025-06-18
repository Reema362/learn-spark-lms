
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

      // For authenticated users (including demo), always try Supabase first
      if (!isDemoMode) {
        // Real Supabase user - upload directly
        console.log('Attempting Supabase upload for authenticated user');
        
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

        console.log('File uploaded successfully to courses bucket:', data);

        const { data: publicUrl } = supabase.storage
          .from('courses')
          .getPublicUrl(data.path);

        const finalUrl = publicUrl.publicUrl;
        console.log('Generated public URL from courses bucket:', finalUrl);
        
        return finalUrl;
      } else {
        // Demo mode - try Supabase first, fall back to demo if it fails
        try {
          console.log('Demo mode: Attempting Supabase upload first');
          
          const { data, error } = await supabase.storage
            .from('courses')
            .upload(finalPath, file, {
              cacheControl: '3600',
              upsert: true
            });

          if (!error && data) {
            console.log('Demo mode: Supabase upload successful:', data);
            
            const { data: publicUrl } = supabase.storage
              .from('courses')
              .getPublicUrl(data.path);

            const finalUrl = publicUrl.publicUrl;
            console.log('Demo mode: Generated public URL from courses bucket:', finalUrl);
            
            return finalUrl;
          } else {
            console.log('Demo mode: Supabase upload failed, falling back to demo storage');
            return this.handleDemoModeUpload(file, finalPath);
          }
        } catch (supabaseError) {
          console.log('Demo mode: Supabase error, falling back to demo storage:', supabaseError);
          return this.handleDemoModeUpload(file, finalPath);
        }
      }
      
    } catch (error: any) {
      console.error('File upload failed:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  private static handleDemoModeUpload(file: File, finalPath: string): string {
    console.log('Demo mode: Simulating file upload');
    
    // Create a proper demo URL that can be used for video playback
    const fileUrl = URL.createObjectURL(file);
    const demoUrl = `demo://${finalPath}`;
    
    // Store demo file info in localStorage with the actual blob URL
    const demoFiles = JSON.parse(localStorage.getItem('demo-uploaded-files') || '[]');
    const demoFile = {
      path: finalPath,
      url: demoUrl,
      blobUrl: fileUrl, // Store the actual blob URL for playback
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      size: file.size,
      type: file.type
    };
    demoFiles.push(demoFile);
    localStorage.setItem('demo-uploaded-files', JSON.stringify(demoFiles));
    
    console.log('Demo file upload simulated:', demoUrl);
    return demoUrl;
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
    // Check if this is a demo mode URL
    if (path.startsWith('demo://')) {
      // Extract the path and find the blob URL from localStorage
      const demoPath = path.replace('demo://', '');
      const demoFiles = JSON.parse(localStorage.getItem('demo-uploaded-files') || '[]');
      const demoFile = demoFiles.find((file: any) => file.path === demoPath);
      
      if (demoFile && demoFile.blobUrl) {
        console.log('Using demo blob URL for video playback:', demoFile.blobUrl);
        return demoFile.blobUrl;
      }
      
      // Fallback for demo URLs without blob
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
      // Check demo mode first
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
