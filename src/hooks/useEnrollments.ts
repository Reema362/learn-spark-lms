
import { useQuery } from '@tanstack/react-query';
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
        // For Supabase users - this would be handled by RLS policies and triggers
        return [];
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
