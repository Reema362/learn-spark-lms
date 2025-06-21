
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCourseEnrollments = (userId?: string) => {
  return useQuery({
    queryKey: ['course-enrollments', userId],
    queryFn: async () => {
      if (!userId) return [];

      // Check authentication type
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Use Supabase for authenticated users
        const { data, error } = await supabase
          .from('course_enrollments')
          .select(`
            *,
            courses(id, title, description, status)
          `)
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching enrollments:', error);
          return [];
        }

        return data || [];
      } else {
        // Use localStorage for demo users
        const demoEnrollments = JSON.parse(localStorage.getItem('demo-enrollments') || '[]');
        const userEnrollments = demoEnrollments.filter((enrollment: any) => 
          enrollment.user_id === userId
        );

        // Get course details for enrollments
        const demoCourses = JSON.parse(localStorage.getItem('demo-courses') || '[]');
        const enrichedEnrollments = userEnrollments.map((enrollment: any) => {
          const course = demoCourses.find((c: any) => c.id === enrollment.course_id);
          return {
            ...enrollment,
            courses: course ? {
              id: course.id,
              title: course.title,
              description: course.description,
              status: course.status
            } : null
          };
        }).filter((enrollment: any) => enrollment.courses !== null);

        return enrichedEnrollments;
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Auto-enroll learner in all published courses
export const useAutoEnrollInPublishedCourses = (userId?: string) => {
  return useQuery({
    queryKey: ['auto-enroll-published-courses', userId],
    queryFn: async () => {
      if (!userId) return [];

      // Check authentication type
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // For Supabase users - auto-enroll in all published courses
        console.log('Auto-enrolling Supabase user in published courses');
        
        // Get all published courses
        const { data: publishedCourses, error: coursesError } = await supabase
          .from('courses')
          .select('id, title')
          .eq('status', 'published');

        if (coursesError) {
          console.error('Error fetching published courses:', coursesError);
          return [];
        }

        if (!publishedCourses || publishedCourses.length === 0) {
          console.log('No published courses found');
          return [];
        }

        // Get existing enrollments for this user
        const { data: existingEnrollments } = await supabase
          .from('course_enrollments')
          .select('course_id')
          .eq('user_id', userId);

        const enrolledCourseIds = new Set(existingEnrollments?.map(e => e.course_id) || []);

        // Find courses that need enrollment
        const coursesToEnroll = publishedCourses.filter(course => 
          !enrolledCourseIds.has(course.id)
        );

        if (coursesToEnroll.length > 0) {
          console.log(`Auto-enrolling in ${coursesToEnroll.length} new published courses`);
          
          // Create enrollments for new courses
          const enrollments = coursesToEnroll.map(course => ({
            user_id: userId,
            course_id: course.id,
            status: 'not_started',
            progress_percentage: 0,
            enrolled_at: new Date().toISOString()
          }));

          const { error: enrollError } = await supabase
            .from('course_enrollments')
            .insert(enrollments);

          if (enrollError) {
            console.error('Error auto-enrolling in courses:', enrollError);
          } else {
            console.log('Successfully auto-enrolled in published courses');
          }
        }

        return publishedCourses;
      } else {
        // For demo users - auto-enroll in published courses
        const demoCourses = JSON.parse(localStorage.getItem('demo-courses') || '[]');
        const publishedCourses = demoCourses.filter((course: any) => course.status === 'published');
        
        const demoEnrollments = JSON.parse(localStorage.getItem('demo-enrollments') || '[]');
        let enrollmentsUpdated = false;

        publishedCourses.forEach((course: any) => {
          const existingEnrollment = demoEnrollments.find((e: any) => 
            e.user_id === userId && e.course_id === course.id
          );

          if (!existingEnrollment) {
            demoEnrollments.push({
              id: crypto.randomUUID(),
              user_id: userId,
              course_id: course.id,
              status: 'not_started',
              progress_percentage: 0,
              enrolled_at: new Date().toISOString()
            });
            enrollmentsUpdated = true;
          }
        });

        if (enrollmentsUpdated) {
          localStorage.setItem('demo-enrollments', JSON.stringify(demoEnrollments));
          console.log('Auto-enrolled user in published courses');
        }

        return publishedCourses;
      }
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // Check every 30 seconds
  });
};

// Add missing exports for CourseViewer
export const useEnrollUserInCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, courseId }: { userId: string; courseId: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data, error } = await supabase
          .from('course_enrollments')
          .insert({
            user_id: userId,
            course_id: courseId,
            status: 'not_started',
            progress_percentage: 0,
            enrolled_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Demo mode
        const demoEnrollments = JSON.parse(localStorage.getItem('demo-enrollments') || '[]');
        const newEnrollment = {
          id: crypto.randomUUID(),
          user_id: userId,
          course_id: courseId,
          status: 'not_started',
          progress_percentage: 0,
          enrolled_at: new Date().toISOString()
        };
        demoEnrollments.push(newEnrollment);
        localStorage.setItem('demo-enrollments', JSON.stringify(demoEnrollments));
        return newEnrollment;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-enrollments'] });
    },
  });
};

export const useUpdateLessonProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, lessonId, progress }: { userId: string; lessonId: string; progress: number }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data, error } = await supabase
          .from('lesson_progress')
          .upsert({
            user_id: userId,
            lesson_id: lessonId,
            progress_percentage: progress,
            completed_at: progress === 100 ? new Date().toISOString() : null
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Demo mode - store in localStorage
        const demoProgress = JSON.parse(localStorage.getItem('demo-lesson-progress') || '[]');
        const existingIndex = demoProgress.findIndex((p: any) => 
          p.user_id === userId && p.lesson_id === lessonId
        );
        
        const progressData = {
          id: crypto.randomUUID(),
          user_id: userId,
          lesson_id: lessonId,
          progress_percentage: progress,
          completed_at: progress === 100 ? new Date().toISOString() : null,
          created_at: new Date().toISOString()
        };
        
        if (existingIndex >= 0) {
          demoProgress[existingIndex] = { ...demoProgress[existingIndex], ...progressData };
        } else {
          demoProgress.push(progressData);
        }
        
        localStorage.setItem('demo-lesson-progress', JSON.stringify(demoProgress));
        return progressData;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress'] });
      queryClient.invalidateQueries({ queryKey: ['course-enrollments'] });
    },
  });
};

export const useCheckCourseCompletion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, courseId }: { userId: string; courseId: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if all lessons are completed
        const { data: lessons } = await supabase
          .from('lessons')
          .select('id')
          .eq('course_id', courseId);

        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('user_id', userId)
          .eq('progress_percentage', 100);

        const allCompleted = lessons?.length === progress?.length;

        if (allCompleted) {
          const { data, error } = await supabase
            .from('course_enrollments')
            .update({
              status: 'completed',
              progress_percentage: 100,
              completed_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .select()
            .single();

          if (error) throw error;
          return data;
        }
      } else {
        // Demo mode
        const demoLessons = JSON.parse(localStorage.getItem('demo-lessons') || '[]');
        const courseLessons = demoLessons.filter((l: any) => l.course_id === courseId);
        
        const demoProgress = JSON.parse(localStorage.getItem('demo-lesson-progress') || '[]');
        const completedLessons = demoProgress.filter((p: any) => 
          p.user_id === userId && p.progress_percentage === 100 &&
          courseLessons.some((l: any) => l.id === p.lesson_id)
        );

        const allCompleted = courseLessons.length === completedLessons.length && courseLessons.length > 0;

        if (allCompleted) {
          const demoEnrollments = JSON.parse(localStorage.getItem('demo-enrollments') || '[]');
          const enrollmentIndex = demoEnrollments.findIndex((e: any) => 
            e.user_id === userId && e.course_id === courseId
          );
          
          if (enrollmentIndex >= 0) {
            demoEnrollments[enrollmentIndex] = {
              ...demoEnrollments[enrollmentIndex],
              status: 'completed',
              progress_percentage: 100,
              completed_at: new Date().toISOString()
            };
            localStorage.setItem('demo-enrollments', JSON.stringify(demoEnrollments));
            return demoEnrollments[enrollmentIndex];
          }
        }
      }
      
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-enrollments'] });
    },
  });
};
