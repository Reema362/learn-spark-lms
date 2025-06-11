
import { supabase } from '@/integrations/supabase/client';

export class TemplateService {
  static async getTemplates() {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createTemplate(templateData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('templates')
      .insert({
        ...templateData,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTemplate(id: string, updates: any) {
    const { data, error } = await supabase
      .from('templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTemplate(id: string) {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
