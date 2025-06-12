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
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Use Supabase if authenticated
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_categories(name, color),
          profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching courses:', error);
        throw error;
      }
      
      console.log('Fetched courses from Supabase:', data);
      return data || [];
    } else {
      // Return demo courses for app session users
      const demoCourses = JSON.parse(localStorage.getItem('demo-courses') || '[]');
      console.log('Fetched demo courses:', demoCourses);
      return demoCourses;
    }
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
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Use Supabase if authenticated
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
          created_by: session.user.id,
          status: 'published' // Default to published so learners can see it
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating course:', error);
        throw error;
      }
      
      console.log('Course created successfully:', data);
      return data;
    } else {
      // Create demo course for app session users
      const userSession = localStorage.getItem('avocop_user');
      if (!userSession) throw new Error('Not authenticated');

      const user = JSON.parse(userSession);
      if (user.role !== 'admin') throw new Error('Permission denied');

      const newCourse = {
        id: crypto.randomUUID(),
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
        status: 'published', // Default to published
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const demoCourses = JSON.parse(localStorage.getItem('demo-courses') || '[]');
      demoCourses.push(newCourse);
      localStorage.setItem('demo-courses', JSON.stringify(demoCourses));

      console.log('Demo course created:', newCourse);
      return newCourse;
    }
  }

  static async updateCourse(id: string, updates: Partial<Course>) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Validate category if updating
      if (updates.category_id !== undefined) {
        if (updates.category_id) {
          const { data: category, error: categoryError } = await supabase
            .from('course_categories')
            .select('id')
            .eq('id', updates.category_id)
            .single();

          if (categoryError || !category) {
            throw new Error('Invalid category_id provided');
          }
        } else {
          updates.category_id = null;
        }
      }

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
    } else {
      // Update demo course
      const demoCourses = JSON.parse(localStorage.getItem('demo-courses') || '[]');
      const courseIndex = demoCourses.findIndex((c: any) => c.id === id);
      
      if (courseIndex === -1) throw new Error('Course not found');
      
      demoCourses[courseIndex] = { ...demoCourses[courseIndex], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem('demo-courses', JSON.stringify(demoCourses));
      
      return demoCourses[courseIndex];
    }
  }

  static async deleteCourse(id: string) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } else {
      // Delete from demo courses
      const demoCourses = JSON.parse(localStorage.getItem('demo-courses') || '[]');
      const updatedCourses = demoCourses.filter((c: any) => c.id !== id);
      localStorage.setItem('demo-courses', JSON.stringify(updatedCourses));
    }
  }

  static async createLesson(lessonData: any) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
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
    } else {
      // Create demo lesson
      const newLesson = {
        id: crypto.randomUUID(),
        title: lessonData.title,
        content: lessonData.content,
        course_id: lessonData.course_id,
        order_index: lessonData.order_index || 0,
        duration_minutes: lessonData.duration_minutes || 0,
        type: lessonData.type || 'text',
        video_url: lessonData.video_url,
        document_url: lessonData.document_url,
        is_required: lessonData.is_required !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const demoLessons = JSON.parse(localStorage.getItem('demo-lessons') || '[]');
      demoLessons.push(newLesson);
      localStorage.setItem('demo-lessons', JSON.stringify(demoLessons));

      return newLesson;
    }
  }

  static async getCourseCategories() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } else {
      // Return demo categories
      const demoCategories = JSON.parse(localStorage.getItem('demo-categories') || '[]');
      if (demoCategories.length === 0) {
        // Create default categories for demo
        const defaultCategories = [
          { id: '1', name: 'Security', color: '#FF6B6B', description: 'Security courses' },
          { id: '2', name: 'Compliance', color: '#4ECDC4', description: 'Compliance training' },
          { id: '3', name: 'Data Protection', color: '#45B7D1', description: 'Data protection courses' }
        ];
        localStorage.setItem('demo-categories', JSON.stringify(defaultCategories));
        return defaultCategories;
      }
      return demoCategories;
    }
  }

  static async createCourseCategory(category: { name: string; description?: string; color?: string }) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
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
    } else {
      // Create demo category
      const newCategory = {
        id: crypto.randomUUID(),
        name: category.name,
        description: category.description,
        color: category.color || '#3B82F6',
        created_at: new Date().toISOString()
      };

      const demoCategories = JSON.parse(localStorage.getItem('demo-categories') || '[]');
      demoCategories.push(newCategory);
      localStorage.setItem('demo-categories', JSON.stringify(demoCategories));

      return newCategory;
    }
  }
}
