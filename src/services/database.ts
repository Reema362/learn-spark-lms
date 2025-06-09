import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type Course = Tables['courses']['Row'];
type Profile = Tables['profiles']['Row'];
type CourseCategory = Tables['course_categories']['Row'];
type Lesson = Tables['lessons']['Row'];
type CourseEnrollment = Tables['course_enrollments']['Row'];
type Campaign = Tables['campaigns']['Row'];
type Escalation = Tables['escalations']['Row'];
type Query = Tables['queries']['Row'];
type Template = Tables['templates']['Row'];
type Game = Tables['games']['Row'];
type GameSession = Tables['game_sessions']['Row'];

export class DatabaseService {
  // Initialize storage bucket
  static async initializeStorage() {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketsToCreate = ['courses', 'campaign-assets', 'query-attachments', 'game-assets'];
      
      for (const bucketName of bucketsToCreate) {
        const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
        if (!bucketExists) {
          const { error } = await supabase.storage.createBucket(bucketName, { public: true });
          if (error) console.log('Bucket creation info:', error.message);
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

  // Fixed User Management with proper auth integration
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
      
      // Use the database function for proper user creation
      const { data, error } = await supabase.rpc('create_auth_user', {
        user_email: userData.email,
        user_password: userData.password,
        user_first_name: userData.first_name || '',
        user_last_name: userData.last_name || '',
        user_role: userData.role || 'user',
        user_department: userData.department || ''
      });

      if (error) {
        console.error('Database error creating user:', error);
        throw error;
      }

      console.log('User created successfully:', data);
      return data;
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
    
    for (const user of users) {
      try {
        if (!user.email || !user.email.includes('@')) {
          throw new Error('Invalid email format');
        }

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
        profiles(first_name, last_name),
        campaign_assets(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createCampaign(campaign: {
    name: string;
    description?: string;
    status?: string;
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
        ...campaign,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCampaign(id: string, updates: Partial<Campaign>) {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteCampaign(id: string) {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async uploadCampaignAsset(campaignId: string, file: File) {
    const fileName = `${campaignId}/${Date.now()}_${file.name}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('campaign-assets')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('campaign-assets')
      .getPublicUrl(uploadData.path);

    const { data, error } = await supabase
      .from('campaign_assets')
      .insert({
        campaign_id: campaignId,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size
      })
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
        assigned_to_profile:profiles!escalations_assigned_to_fkey(first_name, last_name, email),
        created_by_profile:profiles!escalations_created_by_fkey(first_name, last_name, email),
        escalation_comments(*, profiles(first_name, last_name))
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createEscalation(escalation: {
    title: string;
    description: string;
    priority?: string;
    assigned_to?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('escalations')
      .insert({
        ...escalation,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateEscalation(id: string, updates: Partial<Escalation>) {
    const { data, error } = await supabase
      .from('escalations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async addEscalationComment(escalationId: string, comment: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('escalation_comments')
      .insert({
        escalation_id: escalationId,
        comment,
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
        submitted_by_profile:profiles!queries_submitted_by_fkey(first_name, last_name, email),
        assigned_to_profile:profiles!queries_assigned_to_fkey(first_name, last_name, email),
        query_responses(*, profiles(first_name, last_name)),
        query_attachments(*)
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

  static async addQueryResponse(queryId: string, response: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('query_responses')
      .insert({
        query_id: queryId,
        response,
        responded_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async uploadQueryAttachment(queryId: string, file: File) {
    const fileName = `${queryId}/${Date.now()}_${file.name}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('query-attachments')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('query-attachments')
      .getPublicUrl(uploadData.path);

    const { data, error } = await supabase
      .from('query_attachments')
      .insert({
        query_id: queryId,
        file_name: file.name,
        file_url: publicUrl
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
      .select(`
        *,
        profiles(first_name, last_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createTemplate(template: {
    name: string;
    type: string;
    subject?: string;
    content: string;
    variables?: any;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('templates')
      .insert({
        ...template,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTemplate(id: string, updates: Partial<Template>) {
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
        roles(name, description),
        assigned_by_profile:profiles!user_roles_assigned_by_fkey(first_name, last_name)
      `)
      .order('assigned_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async assignRole(userId: string, roleId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
        assigned_by: user.id
      })
      .select()
      .single();

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
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createGame(game: {
    title: string;
    description?: string;
    game_type: string;
    difficulty?: string;
    topic: string;
    time_limit_seconds?: number;
    questions: any;
    passing_score?: number;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('games')
      .insert({
        ...game,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getGameBadges() {
    const { data, error } = await supabase
      .from('game_badges')
      .select('*')
      .order('topic', { ascending: true });
    
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

    // Check if user earned any badges
    await this.checkAndAwardBadges(user.id, gameId, score, timeTaken);

    return data;
  }

  static async checkAndAwardBadges(userId: string, gameId: string, score: number, timeTaken: number) {
    // Get game details to know the topic
    const { data: game } = await supabase
      .from('games')
      .select('topic')
      .eq('id', gameId)
      .single();

    if (!game) return;

    // Get badges for this topic
    const { data: badges } = await supabase
      .from('game_badges')
      .select('*')
      .eq('topic', game.topic);

    if (!badges) return;

    // Check each badge criteria
    for (const badge of badges) {
      const criteria = badge.criteria as any;
      if (score >= criteria.min_score && timeTaken <= criteria.max_time) {
        // Check if user already has this badge
        const { data: existingBadge } = await supabase
          .from('user_game_badges')
          .select('id')
          .eq('user_id', userId)
          .eq('badge_id', badge.id)
          .single();

        if (!existingBadge) {
          // Award the badge
          await supabase
            .from('user_game_badges')
            .insert({
              user_id: userId,
              badge_id: badge.id
            });
        }
      }
    }
  }

  static async getUserGameStats(userId?: string) {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!targetUserId) return null;

    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', targetUserId);

    const { data: badges } = await supabase
      .from('user_game_badges')
      .select('*, game_badges(*)')
      .eq('user_id', targetUserId);

    return {
      totalGamesPlayed: sessions?.length || 0,
      totalBadgesEarned: badges?.length || 0,
      averageScore: sessions?.reduce((acc, s) => acc + s.score, 0) / (sessions?.length || 1) || 0,
      badges: badges || []
    };
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
