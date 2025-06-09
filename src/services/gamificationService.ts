
import { supabase } from '@/integrations/supabase/client';

export class GamificationService {
  static async getGames() {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async getGameBadges() {
    const { data, error } = await supabase
      .from('game_badges')
      .select('*')
      .order('tier', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  static async createGame(game: {
    title: string;
    description?: string;
    game_type: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    topic: string;
    time_limit_seconds?: number;
    questions: any[];
    passing_score?: number;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('games')
      .insert({
        title: game.title,
        description: game.description,
        game_type: game.game_type,
        difficulty: game.difficulty as any || 'easy',
        topic: game.topic,
        time_limit_seconds: game.time_limit_seconds,
        questions: game.questions,
        passing_score: game.passing_score,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async submitGameSession(gameId: string, score: number, timeTaken: number, answers: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        game_id: gameId,
        user_id: user.id,
        score,
        time_taken_seconds: timeTaken,
        answers
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserGameStats(userId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('game_sessions')
      .select(`
        *,
        games(title, topic)
      `)
      .eq('user_id', targetUserId)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getLeaderboard() {
    const { data, error } = await supabase
      .from('game_sessions')
      .select(`
        user_id,
        score,
        profiles(first_name, last_name)
      `)
      .order('score', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data;
  }
}
