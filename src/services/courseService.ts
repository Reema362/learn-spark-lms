import { supabase } from '@/integrations/supabase/client';

export class CourseService {
  static async getCourses() {
    try {
      console.log('🔍 CourseService.getCourses() - Starting course fetch...');
      
      // Check for Supabase session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔍 CourseService - Supabase session check:', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        userId: session?.user?.id,
        sessionError 
      });

      // If we have a Supabase session, use it
      if (session?.user) {
        console.log('✅ CourseService - Using authenticated Supabase session');
        
        const { data: courses, error } = await supabase
          .from('courses')
          .select(`
            *,
            course_categories (
              id,
              name,
              color,
              description
            )
          `);

        if (error) {
          console.error('❌ CourseService - Supabase query error:', error);
          throw error;
        }

        console.log('✅ CourseService - Successfully fetched courses via Supabase:', courses?.length || 0);
        return courses || [];
      }

      // Fallback: Check for app session in localStorage
      const appSession = localStorage.getItem('avocop_user');
      if (appSession) {
        console.log('🔍 CourseService - No Supabase session, trying with app session...');
        
        try {
          const userData = JSON.parse(appSession);
          console.log('🔍 CourseService - App session user:', userData);

          // For app sessions, we still need to try the Supabase query
          // The RLS policies should handle access appropriately
          const { data: courses, error } = await supabase
            .from('courses')
            .select(`
              *,
              course_categories (
                id,
                name,
                color,
                description
              )
            `);

          if (error) {
            console.error('❌ CourseService - Supabase query error with app session:', error);
            
            // If RLS blocks access, return empty array but log it
            if (error.code === 'PGRST301' || error.message.includes('RLS')) {
              console.log('🔍 CourseService - RLS blocked access, user needs proper Supabase session');
              return [];
            }
            throw error;
          }

          console.log('✅ CourseService - Successfully fetched courses via app session:', courses?.length || 0);
          return courses || [];
        } catch (parseError) {
          console.error('❌ CourseService - Error parsing app session:', parseError);
        }
      }

      console.log('❌ CourseService - No valid session found');
      return [];

    } catch (error: any) {
      console.error('❌ CourseService.getCourses() - Fatal error:', error);
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }
  }

  static async getCourseCategories() {
    const { data, error } = await supabase
      .from('course_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }

  static async createCourse(course: any) {
    const { data, error } = await supabase
      .from('courses')
      .insert(course)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCourse(id: string, updates: any) {
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

  static async createCourseCategory(category: { name: string; description?: string; color?: string }) {
    const { data, error } = await supabase
      .from('course_categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
