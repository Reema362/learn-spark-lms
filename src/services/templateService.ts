
import { supabase } from '@/integrations/supabase/client';

export class TemplateService {
  static async getTemplates() {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createTemplate(template: {
    name: string;
    type: 'email' | 'sms' | 'alert' | 'notification';
    subject?: string;
    content: string;
    variables?: any[];
    is_active?: boolean;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('templates')
      .insert({
        name: template.name,
        type: template.type as any,
        subject: template.subject,
        content: template.content,
        variables: template.variables,
        is_active: template.is_active,
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
