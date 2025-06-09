
import { supabase } from '@/integrations/supabase/client';

export class FileService {
  static async uploadFile(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('course-content')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from('course-content')
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  }

  static async deleteFile(path: string) {
    const { error } = await supabase.storage
      .from('course-content')
      .remove([path]);

    if (error) throw error;
  }
}
