
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type Course = Tables['courses']['Row'];
type Profile = Tables['profiles']['Row'];
type CourseCategory = Tables['course_categories']['Row'];
type Lesson = Tables['lessons']['Row'];
type CourseEnrollment = Tables['course_enrollments']['Row'];

export class DatabaseService {
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

  static async createCourse(course: Partial<Course>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('courses')
      .insert({
        ...course,
        created_by: user.id
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

  // User Management
  static async getUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createUser(userData: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    role?: 'admin' | 'learner' | 'instructor';
    department?: string;
  }) {
    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      user_metadata: {
        first_name: userData.first_name,
        last_name: userData.last_name
      }
    });

    if (authError) throw authError;

    // Update profile with additional data
    if (authData.user && (userData.role || userData.department)) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: userData.role || 'learner',
          department: userData.department
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;
    }

    return authData.user;
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
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;
  }

  // Course Categories
  static async getCourseCategories() {
    const { data, error } = await supabase
      .from('course_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }

  static async createCourseCategory(category: Partial<CourseCategory>) {
    const { data, error } = await supabase
      .from('course_categories')
      .insert(category)
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

  static async createLesson(lesson: Partial<Lesson>) {
    const { data, error } = await supabase
      .from('lessons')
      .insert(lesson)
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

  // File Upload
  static async uploadFile(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('course-content')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from('course-content')
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  }

  static async deleteFile(path: string) {
    const { error } = await supabase.storage
      .from('course-content')
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
}
