
import { supabase } from '@/integrations/supabase/client';
import { DemoStorageService } from './demoStorageService';

export class UrlService {
  // Helper method to get the correct public URL for a storage path
  static getPublicUrl(path: string): string {
    // Check if this is a demo mode URL
    if (path.startsWith('demo://')) {
      const demoData = DemoStorageService.getDemoFileData(path);
      if (demoData) {
        return demoData;
      }
      
      console.warn('Demo file not found:', path.replace('demo://', ''));
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
}
