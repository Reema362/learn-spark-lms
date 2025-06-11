
import { supabase } from '@/integrations/supabase/client';

export class IAMService {
  static async getRoles() {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching roles:', error);
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }

  static async getUserRoles() {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          profiles(first_name, last_name, email),
          roles(name, description)
        `)
        .order('assigned_at', { ascending: false });

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }

  static async getAuditLogs() {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }
}
