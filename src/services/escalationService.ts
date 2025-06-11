
import { supabase } from '@/integrations/supabase/client';

export class EscalationService {
  static async getEscalations() {
    try {
      const { data, error } = await supabase
        .from('escalations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching escalations:', error);
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Error fetching escalations:', error);
      return [];
    }
  }

  static async createEscalation(escalationData: any) {
    // Check if user is authenticated via our app's auth system
    const userSession = localStorage.getItem('avocop_user');
    if (!userSession) {
      throw new Error('Permission denied: You must be logged in to create escalations.');
    }

    let user = null;
    try {
      const parsedSession = JSON.parse(userSession);
      user = parsedSession;
    } catch (parseError) {
      throw new Error('Permission denied: Invalid session. Please log in again.');
    }

    if (!user || user.role !== 'admin') {
      throw new Error('Permission denied: Admin access required to create escalations.');
    }

    try {
      const { data, error } = await supabase
        .from('escalations')
        .insert({
          title: escalationData.title,
          description: escalationData.description,
          priority: escalationData.priority,
          status: escalationData.status,
          assigned_to: escalationData.assigned_to,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Escalation creation error:', error);
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error creating escalation:', error);
      throw new Error(`Failed to create escalation: ${error.message}`);
    }
  }
}
