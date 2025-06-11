
import { supabase } from '@/integrations/supabase/client';

export class QueryService {
  static async getQueries() {
    try {
      const { data, error } = await supabase
        .from('queries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching queries:', error);
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Error fetching queries:', error);
      return [];
    }
  }

  static async createQuery(queryData: any) {
    // Check if user is authenticated via our app's auth system
    const userSession = localStorage.getItem('avocop_user');
    if (!userSession) {
      throw new Error('Permission denied: You must be logged in to create queries.');
    }

    let user = null;
    try {
      const parsedSession = JSON.parse(userSession);
      user = parsedSession;
    } catch (parseError) {
      throw new Error('Permission denied: Invalid session. Please log in again.');
    }

    try {
      const { data, error } = await supabase
        .from('queries')
        .insert({
          title: queryData.title,
          description: queryData.description,
          category: queryData.category,
          status: queryData.status || 'open',
          submitted_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Query creation error:', error);
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error creating query:', error);
      throw new Error(`Failed to create query: ${error.message}`);
    }
  }
}
