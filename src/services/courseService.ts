
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
        console.error('Error fetching courses from Supabase:', error);
        throw error;
      }
      return data || [];
    } else {
      // Return demo courses for app session users - always check localStorage
      const demoCourses = JSON.parse(localStorage.getItem('demo-courses') || '[]');
      console.log('Loaded demo courses from localStorage:', demoCourses);
      
      // If no courses exist, create some default published courses for demo
      if (demoCourses.length === 0) {
        const defaultCourses = [
          {
            id: 'demo-course-1',
            title: 'Security Awareness Training',
            description: 'Learn the fundamentals of information security and best practices.',
            content: 'This course covers essential security topics including password management, phishing awareness, and data protection.',
            category_id: '1',
            duration_hours: 2,
            difficulty_level: 'beginner',
            is_mandatory: true,
            thumbnail_url: null,
            video_url: null,
            status: 'published',
            created_by: 'demo-admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-course-2',
            title: 'Data Privacy Essentials',
            description: 'Understanding data privacy regulations and compliance requirements.',
            content: 'Comprehensive overview of GDPR, data handling, and privacy protection measures.',
            category_id: '3',
            duration_hours: 1.5,
            difficulty_level: 'intermediate',
            is_mandatory: false,
            thumbnail_url: null,
            video_url: null,
            status: 'published',
            created_by: 'demo-admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        localStorage.setItem('demo-courses', JSON.stringify(defaultCourses));
        console.log('Created default demo courses');
        return defaultCourses;
      }
      
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
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
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
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const demoCourses = JSON.parse(localStorage.getItem('demo-courses') || '[]');
      demoCourses.push(newCourse);
      localStorage.setItem('demo-courses', JSON.stringify(demoCourses));
      console.log('Created new demo course:', newCourse);

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

      // If course is being published, automatically create enrollments for all learners
      if (updates.status === 'published') {
        await this.autoEnrollLearnersInCourse(id);
      }

      return data;
    } else {
      // Update demo course
      const demoCourses = JSON.parse(localStorage.getItem('demo-courses') || '[]');
      const courseIndex = demoCourses.findIndex((c: any) => c.id === id);
      
      if (courseIndex === -1) throw new Error('Course not found');
      
      const updatedCourse = { ...demoCourses[courseIndex], ...updates, updated_at: new Date().toISOString() };
      demoCourses[courseIndex] = updatedCourse;
      localStorage.setItem('demo-courses', JSON.stringify(demoCourses));
      console.log('Updated demo course:', updatedCourse);

      // If course is being published, automatically create demo enrollments
      if (updates.status === 'published') {
        await this.autoEnrollDemoLearnersInCourse(id);
      }
      
      return updatedCourse;
    }
  }

  static async deleteCourse(id: string) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Delete from Supabase - this will cascade delete related data
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('Course deleted from Supabase:', id);
    } else {
      // Delete from demo courses with comprehensive cleanup
      const demoCourses = JSON.parse(localStorage.getItem('demo-courses') || '[]');
      const courseToDelete = demoCourses.find((c: any) => c.id === id);
      
      if (courseToDelete) {
        // Remove course from courses list
        const updatedCourses = demoCourses.filter((c: any) => c.id !== id);
        localStorage.setItem('demo-courses', JSON.stringify(updatedCourses));
        console.log('Deleted demo course from courses list:', id);

        // Remove related enrollments
        const demoEnrollments = JSON.parse(localStorage.getItem('demo-enrollments') || '[]');
        const updatedEnrollments = demoEnrollments.filter((e: any) => e.course_id !== id);
        localStorage.setItem('demo-enrollments', JSON.stringify(updatedEnrollments));
        console.log('Deleted related enrollments for course:', id);

        // Remove related lessons
        const demoLessons = JSON.parse(localStorage.getItem('demo-lessons') || '[]');
        const courseLessons = demoLessons.filter((l: any) => l.course_id === id);
        const updatedLessons = demoLessons.filter((l: any) => l.course_id !== id);
        localStorage.setItem('demo-lessons', JSON.stringify(updatedLessons));
        console.log('Deleted related lessons for course:', id);

        // Remove lesson progress for deleted lessons
        const demoProgress = JSON.parse(localStorage.getItem('demo-lesson-progress') || '[]');
        const deletedLessonIds = courseLessons.map((l: any) => l.id);
        const updatedProgress = demoProgress.filter((p: any) => !deletedLessonIds.includes(p.lesson_id));
        localStorage.setItem('demo-lesson-progress', JSON.stringify(updatedProgress));
        console.log('Deleted related lesson progress for course:', id);

        // Remove uploaded files associated with the course (videos, thumbnails, etc.)
        if (courseToDelete.video_url && courseToDelete.video_url.startsWith('demo://')) {
          const videoPath = courseToDelete.video_url.replace('demo://', '');
          
          // Remove from demo-uploaded-files
          const demoFiles = JSON.parse(localStorage.getItem('demo-uploaded-files') || '[]');
          const updatedFiles = demoFiles.filter((f: any) => f.path !== videoPath);
          localStorage.setItem('demo-uploaded-files', JSON.stringify(updatedFiles));
          
          // Remove from demo-persistent-files
          const persistentFiles = JSON.parse(localStorage.getItem('demo-persistent-files') || '{}');
          delete persistentFiles[videoPath];
          localStorage.setItem('demo-persistent-files', JSON.stringify(persistentFiles));
          
          console.log('Deleted associated video file:', videoPath);
        }

        if (courseToDelete.thumbnail_url && courseToDelete.thumbnail_url.startsWith('demo://')) {
          const thumbnailPath = courseToDelete.thumbnail_url.replace('demo://', '');
          
          // Remove from demo-uploaded-files
          const demoFiles = JSON.parse(localStorage.getItem('demo-uploaded-files') || '[]');
          const updatedFiles = demoFiles.filter((f: any) => f.path !== thumbnailPath);
          localStorage.setItem('demo-uploaded-files', JSON.stringify(updatedFiles));
          
          // Remove from demo-persistent-files
          const persistentFiles = JSON.parse(localStorage.getItem('demo-persistent-files') || '{}');
          delete persistentFiles[thumbnailPath];
          localStorage.setItem('demo-persistent-files', JSON.stringify(persistentFiles));
          
          console.log('Deleted associated thumbnail file:', thumbnailPath);
        }

        console.log('Comprehensive deletion completed for demo course:', id);
      } else {
        console.warn('Course not found for deletion:', id);
      }
    }
  }

  // Auto-enroll learners when course is published
  private static async autoEnrollLearnersInCourse(courseId: string) {
    try {
      // Get all users with learner role
      const { data: learners, error: learnersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'user'); // 'user' role represents learners

      if (learnersError || !learners) {
        console.error('Error fetching learners:', learnersError);
        return;
      }

      // Create enrollments for all learners with proper typing
      const enrollments = learners.map(learner => ({
        user_id: learner.id,
        course_id: courseId,
        status: 'not_started' as const,
        progress_percentage: 0,
        enrolled_at: new Date().toISOString()
      }));

      const { error: enrollmentError } = await supabase
        .from('course_enrollments')
        .insert(enrollments);

      if (enrollmentError) {
        console.error('Error creating auto-enrollments:', enrollmentError);
      } else {
        console.log(`Auto-enrolled ${learners.length} learners in course ${courseId}`);
      }
    } catch (error) {
      console.error('Error in auto-enrollment process:', error);
    }
  }

  // Auto-enroll demo learners when course is published
  private static async autoEnrollDemoLearnersInCourse(courseId: string) {
    try {
      // Get existing demo enrollments
      const demoEnrollments = JSON.parse(localStorage.getItem('demo-enrollments') || '[]');
      
      // Create demo learners if they don't exist
      const demoLearners = [
        { id: 'demo-learner-1', email: 'learner1@demo.com', role: 'user' },
        { id: 'demo-learner-2', email: 'learner2@demo.com', role: 'user' },
        { id: 'demo-learner-3', email: 'learner3@demo.com', role: 'user' }
      ];

      // Create enrollments for demo learners
      demoLearners.forEach(learner => {
        // Check if enrollment already exists
        const existingEnrollment = demoEnrollments.find((e: any) => 
          e.user_id === learner.id && e.course_id === courseId
        );

        if (!existingEnrollment) {
          demoEnrollments.push({
            id: crypto.randomUUID(),
            user_id: learner.id,
            course_id: courseId,
            status: 'not_started',
            progress_percentage: 0,
            enrolled_at: new Date().toISOString()
          });
        }
      });

      localStorage.setItem('demo-enrollments', JSON.stringify(demoEnrollments));
      console.log(`Auto-enrolled demo learners in course ${courseId}`);
    } catch (error) {
      console.error('Error in demo auto-enrollment process:', error);
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
      
      // Remove duplicates based on id to prevent repeated categories
      const uniqueCategories = data ? data.filter((category, index, self) => 
        index === self.findIndex(c => c.id === category.id)
      ) : [];
      
      return uniqueCategories;
    } else {
      // Return demo categories with deduplication
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
      
      // Remove duplicates from demo categories too
      const uniqueCategories = demoCategories.filter((category: any, index: number, self: any[]) => 
        index === self.findIndex(c => c.id === category.id)
      );
      
      return uniqueCategories;
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
