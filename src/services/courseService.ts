
import { supabase } from '@/integrations/supabase/client';

interface Course {
  id?: string;
  title: string;
  description?: string;
  content?: string;
  category_id?: string | null;
  duration_hours?: number;
  difficulty_level?: string;
  is_mandatory?: boolean;
  thumbnail_url?: string;
  video_url?: string;
  status?: 'draft' | 'published' | 'archived';
}

export class CourseService {
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
    // Validate category if updating
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
        // Explicitly set to null if empty value is provided
        updates.category_id = null;
      }
    }

    // Ensure status is properly typed if provided
    const updateData: any = { ...updates };
    if (updates.status) {
      updateData.status = updates.status as 'draft' | 'published' | 'archived';
    }

    const { data, error } = await supabase
      .from('courses')
      .update(updateData)
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

  static async createLesson(lessonData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('lessons')
      .insert({
        title: lessonData.title,
        content: lessonData.content,
        course_id: lessonData.course_id,
        order_index: lessonData.order_index || 0,
        duration_minutes: lessonData.duration_minutes || 0,
        type: lessonData.type || 'text',
        video_url: lessonData.video_url,
        document_url: lessonData.document_url,
        is_required: lessonData.is_required !== false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

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
}
