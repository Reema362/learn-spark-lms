import { supabase } from '@/integrations/supabase/client';
import { UserService } from './userService';
import { CourseService } from './courseService';
import { CampaignService } from './campaignService';
import { TemplateService } from './templateService';
import { GamificationService } from './gamificationService';
import { AnalyticsService } from './analyticsService';
import { StorageService } from './storageService';

export class DatabaseService {
  // User Management
  static async getUsers() {
    console.log('Fetching all users from profiles table...');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    console.log(`Successfully fetched ${data?.length || 0} users`);
    return data || [];
  }

  static async createUser(userData: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    role?: 'admin' | 'user';
    department?: string;
  }) {
    return UserService.createUser(userData);
  }

  // Course Management
  static async getCourses() {
    return CourseService.getCourses();
  }

  static async createCourse(courseData: any) {
    return CourseService.createCourse(courseData);
  }

  static async updateCourse(id: string, updates: any) {
    return CourseService.updateCourse(id, updates);
  }

  static async deleteCourse(id: string) {
    return CourseService.deleteCourse(id);
  }

  static async getCourseCategories() {
    return CourseService.getCourseCategories();
  }

  static async createCourseCategory(category: { name: string; description?: string; color?: string }) {
    return CourseService.createCourseCategory(category);
  }

  static async createLesson(lessonData: {
    title: string;
    course_id: string;
    video_url?: string;
    type: string;
    duration_minutes?: number;
    order_index: number;
    content?: string;
  }) {
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        title: lessonData.title,
        course_id: lessonData.course_id,
        video_url: lessonData.video_url,
        type: lessonData.type as any,
        duration_minutes: lessonData.duration_minutes || 0,
        order_index: lessonData.order_index,
        content: lessonData.content
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Campaign Management
  static async getCampaigns() {
    return CampaignService.getCampaigns();
  }

  static async createCampaign(campaignData: any) {
    return CampaignService.createCampaign(campaignData);
  }

  static async updateCampaign(id: string, updates: any) {
    return CampaignService.updateCampaign(id, updates);
  }

  // File Upload
  static async uploadFile(file: File, path: string) {
    return StorageService.uploadFile(file, path);
  }

  // Analytics
  static async getAnalytics() {
    return AnalyticsService.getAnalytics();
  }

  // Escalation Management
  static async getEscalations() {
    const { data, error } = await supabase
      .from('escalations')
      .select(`
        *,
        created_by_profile:profiles!escalations_created_by_fkey(first_name, last_name, email),
        assigned_to_profile:profiles!escalations_assigned_to_fkey(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createEscalation(escalationData: any) {
    const { data, error } = await supabase
      .from('escalations')
      .insert(escalationData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Query Management
  static async getQueries() {
    const { data, error } = await supabase
      .from('queries')
      .select(`
        *,
        submitted_by_profile:profiles!queries_submitted_by_fkey(first_name, last_name, email),
        assigned_to_profile:profiles!queries_assigned_to_fkey(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createQuery(queryData: any) {
    const { data, error } = await supabase
      .from('queries')
      .insert(queryData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Template Management
  static async getTemplates() {
    return TemplateService.getTemplates();
  }

  static async createTemplate(templateData: any) {
    return TemplateService.createTemplate(templateData);
  }

  static async updateTemplate(id: string, updates: any) {
    return TemplateService.updateTemplate(id, updates);
  }

  static async deleteTemplate(id: string) {
    return TemplateService.deleteTemplate(id);
  }

  // IAM Management
  static async getRoles() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async getUserRoles() {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        user:profiles(first_name, last_name, email),
        role:roles(name, description)
      `)
      .order('assigned_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getAuditLogs() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    return data || [];
  }

  // Gamification
  static async getGames() {
    return GamificationService.getGames();
  }

  static async getGameBadges() {
    return GamificationService.getGameBadges();
  }

  static async createGame(gameData: any) {
    return GamificationService.createGame(gameData);
  }

  static async submitGameSession(gameId: string, score: number, timeTaken: number, answers: any) {
    return GamificationService.submitGameSession(gameId, score, timeTaken, answers);
  }

  static async getUserGameStats(userId?: string) {
    return GamificationService.getUserGameStats(userId);
  }

  static async getLeaderboard() {
    return GamificationService.getLeaderboard();
  }
}
