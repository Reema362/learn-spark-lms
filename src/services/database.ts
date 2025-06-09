import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type Course = Tables['courses']['Row'];
type Profile = Tables['profiles']['Row'];
type CourseCategory = Tables['course_categories']['Row'];
type Lesson = Tables['lessons']['Row'];
type CourseEnrollment = Tables['course_enrollments']['Row'];

export class DatabaseService {
  // Initialize storage bucket
  static async initializeStorage() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    // Change 'content' to 'courses'
    const bucketExists = buckets?.some(bucket => bucket.name === 'courses');
    
    if (!bucketExists) {
      // Update bucket name here
      const { error } = await supabase.storage.createBucket('courses', {
        public: true
      });
      if (error) {
        console.log('Bucket creation info:', error.message);
      }
    }
  } catch (error) {
    console.log('Storage initialization info:', error);
  }
}

  // Course Management
  static async getCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_categories(name, color),
        profiles(first_name, last_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createCourse(course: {
  title: string;
  description?: string;
  content?: string;
  category_id?: string;
  duration_hours?: number;
  difficulty_level?: string;
  is_mandatory?: boolean;
  thumbnail_url?: string;
  video_url?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Validate category exists if provided
  if (course.category_id) {
    const { data: category, error: categoryError } = await supabase
      .from('course_categories')
      .select('id')
      .eq('id', course.category_id)
      .single();

    if (categoryError || !category) {
      throw new Error('Invalid category_id provided');
    }
  }

  const { data, error } = await supabase
    .from('courses')
    .insert({
      title: course.title,
      description: course.description,
      content: course.content,
      category_id: course.category_id,
      duration_hours: course.duration_hours || 1,
      difficulty_level: course.difficulty_level || 'beginner',
      is_mandatory: course.is_mandatory || false,
      thumbnail_url: course.thumbnail_url,
      video_url: course.video_url,
      created_by: user.id,
      status: 'draft'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

  static async updateCourse(id: string, updates: Partial<Course>) {
  // Validate category if updating category_id
  if (updates.category_id !== undefined) {
    if (updates.category_id) {
      // Check if category exists when a non-null value is provided
      const { data: category, error: categoryError } = await supabase
        .from('course_categories')
        .select('id')
        .eq('id', updates.category_id)
        .single();

      if (categoryError || !category) {
        throw new Error('Invalid category_id provided');
      }
    } else {
      // Handle case where category_id is being set to null
      updates.category_id = null;
    }
  }

  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

  static async deleteCourse(id: string) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // User Management - Fixed version with proper Supabase Auth integration
  static async getUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
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
    try {
      console.log('Creating user with data:', userData);
      
      // First create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            role: userData.role || 'user',
            department: userData.department || ''
          }
        }
      });

      if (authError) {
        console.error('Auth error creating user:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user in auth');
      }

      // The trigger should automatically create the profile, but let's ensure it exists
      let retries = 3;
      let profile = null;
      
      while (retries > 0 && !profile) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
        
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
          
        if (existingProfile) {
          profile = existingProfile;
          break;
        }
        
        retries--;
      }

      // If profile doesn't exist after retries, create it manually
      if (!profile) {
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: userData.email,
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            role: userData.role || 'user',
            department: userData.department || ''
          })
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Try to clean up the auth user if profile creation fails
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw profileError;
        }
        profile = newProfile;
      }

      console.log('User created successfully:', profile);
      return profile;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  static async bulkCreateUsers(users: Array<{
    email: string;
    first_name?: string;
    last_name?: string;
    department?: string;
    role?: 'admin' | 'user';
  }>) {
    const results = [];
    let successCount = 0;
    
    console.log(`Starting bulk creation of ${users.length} users`);
    
    // Process users in smaller batches to avoid timeout
    const batchSize = 5; // Reduced batch size for more reliable processing
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      for (const user of batch) {
        try {
          // Validate email format
          if (!user.email || !user.email.includes('@')) {
            throw new Error('Invalid email format');
          }

          // Generate a temporary password
          const tempPassword = Math.random().toString(36).slice(-8) + 'Temp123!';
          
          const result = await this.createUser({
            ...user,
            password: tempPassword,
            role: user.role || 'user'
          });
          
          successCount++;
          results.push({ 
            success: true, 
            user: result, 
            tempPassword,
            email: user.email 
          });
          
          console.log(`Successfully created user: ${user.email}`);
        } catch (error) {
          console.error(`Failed to create user ${user.email}:`, error);
          results.push({ 
            success: false, 
            error: error.message, 
            email: user.email 
          });
        }
      }
      
      // Delay between batches
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`Bulk creation completed: ${successCount} successful, ${results.length - successCount} failed`);
    return results;
  }

  static async updateUser(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteUser(id: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Course Categories
  static async getCourseCategories() {
    const { data, error } = await supabase
      .from('course_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async createCourseCategory(category: { name: string; description?: string; color?: string }) {
    const { data, error } = await supabase
      .from('course_categories')
      .insert({
        name: category.name,
        description: category.description,
        color: category.color || '#3B82F6'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Lessons
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

  static async updateLesson(id: string, updates: Partial<Lesson>) {
    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Course Enrollments
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

  // File Upload - Enhanced version with better error handling
  static async uploadFile(file: File, path: string) {
    try {
      // Initialize storage first
      await this.initializeStorage();
      
      // Ensure path doesn't start with slash
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      
      console.log('Uploading file to path:', cleanPath);
      
      const { data, error } = await supabase.storage
        .from('courses')
        .upload(cleanPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      console.log('File uploaded successfully:', data);

      const { data: publicUrl } = supabase.storage
        .from('content')
        .getPublicUrl(data.path);

      return publicUrl.publicUrl;
    } catch (error) {
      console.error('File upload failed:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  static async deleteFile(path: string) {
    const { error } = await supabase.storage
      .from('courses')
      .remove([path]);

    if (error) throw error;
  }

  // Analytics
  static async getAnalytics() {
    const [coursesResult, usersResult, enrollmentsResult] = await Promise.all([
      supabase.from('courses').select('id, status'),
      supabase.from('profiles').select('id, role'),
      supabase.from('course_enrollments').select('id, status, progress_percentage')
    ]);

    return {
      totalCourses: coursesResult.data?.length || 0,
      activeCourses: coursesResult.data?.filter(c => c.status === 'published').length || 0,
      totalUsers: usersResult.data?.length || 0,
      activeUsers: usersResult.data?.filter(u => u.role !== 'admin').length || 0,
      totalEnrollments: enrollmentsResult.data?.length || 0,
      completedEnrollments: enrollmentsResult.data?.filter(e => e.status === 'completed').length || 0,
      averageProgress: enrollmentsResult.data?.reduce((acc, e) => acc + (e.progress_percentage || 0), 0) / (enrollmentsResult.data?.length || 1) || 0
    };
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

  // Campaign Management
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

  // Template Management
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

  // Gamification
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
