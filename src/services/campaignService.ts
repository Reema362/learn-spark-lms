
import { supabase } from '@/integrations/supabase/client';

export class CampaignService {
  static async getCampaigns() {
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        profiles(first_name, last_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createCampaign(campaign: {
    name: string;
    description?: string;
    status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
    start_date?: string;
    end_date?: string;
    target_audience?: string[];
    tags?: string[];
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        name: campaign.name,
        description: campaign.description,
        status: campaign.status as any || 'draft',
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        target_audience: campaign.target_audience,
        tags: campaign.tags,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCampaign(id: string, updates: any) {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
