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
      // Try to create the bucket if it doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'content');
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket('content', {
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

  // User Management - Fixed version for bulk upload
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
      
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', userData.email)
        .maybeSingle();

      if (existingUser) {
        throw new Error(`User with email ${userData.email} already exists`);
      }

      // Create user profile directly in the profiles table with a generated UUID
      const userId = crypto.randomUUID();
      
      // Use admin bypass by temporarily setting auth context
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userData.email,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          role: userData.role || 'user',
          department: userData.department || ''
        })
        .select()
        .single();

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
    
    // Process users in smaller batches to avoid timeout
    const batchSize = 10;
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
      
      // Small delay between batches
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
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
        .from('content')
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
      .from('content')
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
}
