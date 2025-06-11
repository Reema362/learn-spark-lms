
import { supabase } from '@/integrations/supabase/client';

export class TemplateServiceCore {
  static async getTemplates() {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  static async createTemplate(templateData: any) {
    // Check if user is authenticated via our app's auth system
    const userSession = localStorage.getItem('avocop_user');
    if (!userSession) {
      throw new Error('Permission denied: You must be logged in to create templates.');
    }

    let user = null;
    try {
      const parsedSession = JSON.parse(userSession);
      user = parsedSession;
    } catch (parseError) {
      throw new Error('Permission denied: Invalid session. Please log in again.');
    }

    if (!user || user.role !== 'admin') {
      throw new Error('Permission denied: Admin access required to create templates.');
    }

    try {
      const { data, error } = await supabase
        .from('templates')
        .insert({
          name: templateData.name,
          type: templateData.type,
          subject: templateData.subject,
          content: templateData.content,
          variables: templateData.variables || [],
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Template creation error:', error);
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error creating template:', error);
      throw new Error(`Failed to create template: ${error.message}`);
    }
  }

  static async updateTemplate(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Template update error:', error);
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error updating template:', error);
      throw new Error(`Failed to update template: ${error.message}`);
    }
  }

  static async deleteTemplate(id: string) {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Template deletion error:', error);
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error deleting template:', error);
      throw new Error(`Failed to delete template: ${error.message}`);
    }
  }
}
