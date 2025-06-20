
import { DatabaseService } from '@/services/database';
import { supabase } from '@/integrations/supabase/client';

export class CourseMigrationUtility {
  static async migrateDemoCoursesToSupabase(): Promise<{
    success: boolean;
    migratedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let migratedCount = 0;

    try {
      // Check if user is authenticated with Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        errors.push('Must be authenticated with Supabase to migrate courses');
        return { success: false, migratedCount: 0, errors };
      }

      // Get demo courses from localStorage
      const demoCourses = JSON.parse(localStorage.getItem('demo-courses') || '[]');
      const demoCategories = JSON.parse(localStorage.getItem('demo-categories') || '[]');
      
      console.log('Found demo courses to migrate:', demoCourses.length);
      console.log('Found demo categories to migrate:', demoCategories.length);

      // First, migrate categories
      for (const category of demoCategories) {
        try {
          await DatabaseService.createCourseCategory({
            name: category.name,
            color: category.color || '#3B82F6',
            description: category.description || ''
          });
          console.log('Migrated category:', category.name);
        } catch (error: any) {
          if (!error.message.includes('already exists')) {
            errors.push(`Failed to migrate category ${category.name}: ${error.message}`);
          }
        }
      }

      // Then migrate courses
      for (const course of demoCourses) {
        try {
          // Skip if course already exists in Supabase
          const existingCourses = await DatabaseService.getCourses();
          const exists = existingCourses.some((c: any) => c.title === course.title);
          
          if (exists) {
            console.log('Course already exists in Supabase:', course.title);
            continue;
          }

          const courseData = {
            title: course.title,
            description: course.description || '',
            content: course.content || '',
            category_id: course.category_id || null,
            duration_hours: course.duration_hours || 1,
            difficulty_level: course.difficulty_level || 'beginner',
            is_mandatory: course.is_mandatory || false,
            status: course.status || 'published',
            video_url: course.video_url || null,
            thumbnail_url: course.thumbnail_url || null
          };

          const newCourse = await DatabaseService.createCourse(courseData);
          console.log('Migrated course:', course.title);
          
          // Migrate lessons if they exist
          const demoLessons = JSON.parse(localStorage.getItem('demo-lessons') || '[]');
          const courseLessons = demoLessons.filter((l: any) => l.course_id === course.id);
          
          for (const lesson of courseLessons) {
            try {
              await DatabaseService.createLesson({
                title: lesson.title,
                course_id: newCourse.id,
                content: lesson.content || '',
                video_url: lesson.video_url || null,
                document_url: lesson.document_url || null,
                type: lesson.type || 'text',
                duration_minutes: lesson.duration_minutes || 0,
                order_index: lesson.order_index || 0
              });
              console.log('Migrated lesson:', lesson.title);
            } catch (lessonError: any) {
              errors.push(`Failed to migrate lesson ${lesson.title}: ${lessonError.message}`);
            }
          }
          
          migratedCount++;
        } catch (error: any) {
          errors.push(`Failed to migrate course ${course.title}: ${error.message}`);
        }
      }

      // Clear demo data after successful migration
      if (migratedCount > 0) {
        localStorage.removeItem('demo-courses');
        localStorage.removeItem('demo-categories');
        localStorage.removeItem('demo-lessons');
        console.log('Cleared demo data after migration');
      }

      return { success: errors.length === 0, migratedCount, errors };
    } catch (error: any) {
      errors.push(`Migration failed: ${error.message}`);
      return { success: false, migratedCount, errors };
    }
  }

  static async ensureSupabaseAuthentication(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.user;
    } catch {
      return false;
    }
  }

  static async createAdminUserForDemo(email: string, password: string = 'TempPassword123!'): Promise<boolean> {
    try {
      console.log('Creating admin user in Supabase:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: email.includes('naveen') ? 'Naveen' : 'Reema',
            last_name: email.includes('naveen') ? 'V' : 'Jain'
          }
        }
      });

      if (error) {
        console.error('Failed to create admin user:', error);
        return false;
      }

      console.log('Admin user created successfully:', email);
      return true;
    } catch (error) {
      console.error('Error creating admin user:', error);
      return false;
    }
  }
}
