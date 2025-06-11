
import { supabase } from '@/integrations/supabase/client';
import { StorageService } from './storageService';
import { UserService } from './userService';
import { CourseService } from './courseService';
import { CampaignService } from './campaignService';
import { GamificationService } from './gamificationService';
import { EscalationService } from './escalationService';
import { QueryService } from './queryService';
import { TemplateServiceCore } from './templateServiceCore';
import { IAMService } from './iamService';
import { AnalyticsServiceCore } from './analyticsServiceCore';

export class DatabaseService {
  // File upload delegation
  static async uploadFile(file: File, path: string) {
    return StorageService.uploadFile(file, path);
  }

  // User management delegation
  static async getUsers() {
    return UserService.getUsers();
  }

  static async createUser(userData: any) {
    return UserService.createUser(userData);
  }

  // Course management delegation
  static async getCourses() {
    return CourseService.getCourses();
  }

  static async getCourseCategories() {
    return CourseService.getCourseCategories();
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

  static async createLesson(lessonData: any) {
    return CourseService.createLesson(lessonData);
  }

  static async createCourseCategory(categoryData: any) {
    return CourseService.createCourseCategory(categoryData);
  }

  // Campaign management delegation
  static async getCampaigns() {
    return CampaignService.getCampaigns();
  }

  static async createCampaign(campaignData: any) {
    return CampaignService.createCampaign(campaignData);
  }

  static async updateCampaign(id: string, updates: any) {
    return CampaignService.updateCampaign(id, updates);
  }

  // Analytics delegation
  static async getAnalytics() {
    return AnalyticsServiceCore.getAnalytics();
  }

  // Escalation management delegation
  static async getEscalations() {
    return EscalationService.getEscalations();
  }

  static async createEscalation(data: any) {
    return EscalationService.createEscalation(data);
  }

  // Query management delegation
  static async getQueries() {
    return QueryService.getQueries();
  }

  static async createQuery(data: any) {
    return QueryService.createQuery(data);
  }

  // Template management delegation
  static async getTemplates() {
    return TemplateServiceCore.getTemplates();
  }

  static async createTemplate(data: any) {
    return TemplateServiceCore.createTemplate(data);
  }

  static async updateTemplate(id: string, updates: any) {
    return TemplateServiceCore.updateTemplate(id, updates);
  }

  static async deleteTemplate(id: string) {
    return TemplateServiceCore.deleteTemplate(id);
  }

  // IAM management delegation
  static async getRoles() {
    return IAMService.getRoles();
  }

  static async getUserRoles() {
    return IAMService.getUserRoles();
  }

  static async getAuditLogs() {
    return IAMService.getAuditLogs();
  }

  // Gamification delegation
  static async getGames() {
    return GamificationService.getGames();
  }

  static async getGameBadges() {
    return GamificationService.getGameBadges();
  }

  static async createGame(data: any) {
    return GamificationService.createGame(data);
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
