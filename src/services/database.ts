
import { CourseService } from './courseService';
import { UserService } from './userService';
import { CampaignService } from './campaignService';
import { GamificationService } from './gamificationService';
import { TemplateService } from './templateService';
import { StorageService } from './storageService';
import { AnalyticsService } from './analyticsService';
import { supabase } from '@/integrations/supabase/client';

export class DatabaseService {
  // Course Management
  static getCourses = CourseService.getCourses;
  static createCourse = CourseService.createCourse;
  static updateCourse = CourseService.updateCourse;
  static deleteCourse = CourseService.deleteCourse;
  static getCourseCategories = CourseService.getCourseCategories;
  static createCourseCategory = CourseService.createCourseCategory;

  // User Management
  static getUsers = UserService.getUsers;
  static createUser = UserService.createUser;
  static bulkCreateUsers = UserService.bulkCreateUsers;
  static updateUser = UserService.updateUser;
  static deleteUser = UserService.deleteUser;

  // Campaign Management
  static getCampaigns = CampaignService.getCampaigns;
  static createCampaign = CampaignService.createCampaign;
  static updateCampaign = CampaignService.updateCampaign;

  // Gamification
  static getGames = GamificationService.getGames;
  static getGameBadges = GamificationService.getGameBadges;
  static createGame = GamificationService.createGame;
  static submitGameSession = GamificationService.submitGameSession;
  static getUserGameStats = GamificationService.getUserGameStats;
  static getLeaderboard = GamificationService.getLeaderboard;

  // Template Management
  static getTemplates = TemplateService.getTemplates;
  static createTemplate = TemplateService.createTemplate;
  static updateTemplate = TemplateService.updateTemplate;
  static deleteTemplate = TemplateService.deleteTemplate;

  // File Storage
  static initializeStorage = StorageService.initializeStorage;
  static uploadFile = StorageService.uploadFile;
  static deleteFile = StorageService.deleteFile;

  // Analytics
  static getAnalytics = AnalyticsService.getAnalytics;

  // Legacy methods for backward compatibility
  static async getLessonsForCourse(courseId: string) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');
    
    if (error) throw error;
    return data;
  }

  static async createLesson(lesson: {
    title: string;
    course_id: string;
    content?: string;
    video_url?: string;
    document_url?: string;
    duration_minutes?: number;
    order_index?: number;
    type?: string;
    is_required?: boolean;
  }) {
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        title: lesson.title,
        course_id: lesson.course_id,
        content: lesson.content,
        video_url: lesson.video_url,
        document_url: lesson.document_url,
        duration_minutes: lesson.duration_minutes || 0,
        order_index: lesson.order_index || 0,
        type: lesson.type as any || 'text',
        is_required: lesson.is_required || true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateLesson(id: string, updates: any) {
    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getCourseEnrollments(courseId?: string) {
    let query = supabase
      .from('course_enrollments')
      .select(`
        *,
        profiles(first_name, last_name, email),
        courses(title)
      `)
      .order('enrolled_at', { ascending: false });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async enrollUserInCourse(userId: string, courseId: string, assignedBy?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('course_enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        assigned_by: assignedBy || user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Badge System
  static async getBadges() {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }

  static async createBadge(badge: {
    name: string;
    description?: string;
    icon_url?: string;
    criteria?: any;
  }) {
    const { data, error } = await supabase
      .from('badges')
      .insert(badge)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async awardBadge(userId: string, badgeId: string) {
    const { data, error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserBadges(userId: string) {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges(name, description, icon_url)
      `)
      .eq('user_id', userId)
      .order('awarded_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Escalation Management
  static async getEscalations() {
    const { data, error } = await supabase
      .from('escalations')
      .select(`
        *,
        assigned_to_profile:profiles!escalations_assigned_to_fkey(first_name, last_name),
        created_by_profile:profiles!escalations_created_by_fkey(first_name, last_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createEscalation(escalation: {
    title: string;
    description: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    assigned_to?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('escalations')
      .insert({
        title: escalation.title,
        description: escalation.description,
        priority: escalation.priority as any || 'medium',
        assigned_to: escalation.assigned_to,
        created_by: user.id
      })
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
        submitted_by_profile:profiles!queries_submitted_by_fkey(first_name, last_name),
        assigned_to_profile:profiles!queries_assigned_to_fkey(first_name, last_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createQuery(query: {
    title: string;
    description: string;
    category: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('queries')
      .insert({
        ...query,
        submitted_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // IAM Management
  static async getRoles() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }

  static async getUserRoles() {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        profiles(first_name, last_name, email),
        roles(name)
      `)
      .order('assigned_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async getAuditLogs() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        profiles(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    return data;
  }
}
