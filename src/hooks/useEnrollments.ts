
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEnrollUserInCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ courseId, userId }: { courseId: string; userId?: string }) => {
      const { data, error } = await supabase.rpc('auto_enroll_user_in_course', {
        p_course_id: courseId,
        p_user_id: userId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
    },
  });
};

export const useUpdateLessonProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      lessonId, 
      userId, 
      progressPercentage, 
      timeSpentMinutes = 0 
    }: { 
      lessonId: string; 
      userId: string; 
      progressPercentage: number; 
      timeSpentMinutes?: number; 
    }) => {
      const { error } = await supabase.rpc('update_lesson_progress', {
        p_lesson_id: lessonId,
        p_user_id: userId,
        p_progress_percentage: progressPercentage,
        p_time_spent_minutes: timeSpentMinutes
      });
      
      if (error) throw error;
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
    mutationFn: async ({ courseId, userId }: { courseId: string; userId: string }) => {
      const { error } = await supabase.rpc('check_course_completion', {
        p_course_id: courseId,
        p_user_id: userId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useCourseEnrollments = (userId?: string) => {
  return useQuery({
    queryKey: ['course-enrollments', userId],
    queryFn: async () => {
      let query = supabase
        .from('course_enrollments')
        .select(`
          *,
          courses(
            id,
            title,
            description,
            thumbnail_url,
            duration_hours,
            difficulty_level,
            course_categories(name, color)
          )
        `)
        .order('enrolled_at', { ascending: false });
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useLessonProgress = (userId?: string, courseId?: string) => {
  return useQuery({
    queryKey: ['lesson-progress', userId, courseId],
    queryFn: async () => {
      let query = supabase
        .from('lesson_progress')
        .select(`
          *,
          lessons(
            id,
            title,
            course_id,
            order_index
          )
        `);
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      if (courseId) {
        query = query.eq('lessons.course_id', courseId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};
