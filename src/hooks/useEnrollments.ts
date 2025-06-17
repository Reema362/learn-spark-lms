
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEnrollUserInCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ courseId, userId }: { courseId: string; userId?: string }) => {
      // Check if user is already enrolled
      const { data: existingEnrollment } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .single();

      if (existingEnrollment) {
        return existingEnrollment;
      }

      // Create new enrollment
      const { data, error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          user_id: userId,
          status: 'not_started',
          enrolled_at: new Date().toISOString()
        })
        .select()
        .single();
      
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
      // Check if progress record exists
      const { data: existingProgress } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', userId)
        .single();

      if (existingProgress) {
        // Update existing progress
        const { error } = await supabase
          .from('lesson_progress')
          .update({
            progress_percentage: Math.max(existingProgress.progress_percentage || 0, progressPercentage),
            time_spent_minutes: (existingProgress.time_spent_minutes || 0) + timeSpentMinutes,
            completed_at: progressPercentage >= 100 ? new Date().toISOString() : existingProgress.completed_at
          })
          .eq('lesson_id', lessonId)
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('lesson_progress')
          .insert({
            lesson_id: lessonId,
            user_id: userId,
            progress_percentage: progressPercentage,
            time_spent_minutes: timeSpentMinutes,
            completed_at: progressPercentage >= 100 ? new Date().toISOString() : null
          });
        
        if (error) throw error;
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
    mutationFn: async ({ courseId, userId }: { courseId: string; userId: string }) => {
      // Get all lessons for the course
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, is_required')
        .eq('course_id', courseId);

      if (!lessons) return;

      const requiredLessons = lessons.filter(l => l.is_required);
      
      // Get completed lessons
      const { data: completedLessons } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .gte('progress_percentage', 100)
        .in('lesson_id', requiredLessons.map(l => l.id));

      const completionPercentage = requiredLessons.length > 0 
        ? Math.round((completedLessons?.length || 0) / requiredLessons.length * 100)
        : 100;

      // Update course enrollment
      const { error } = await supabase
        .from('course_enrollments')
        .update({
          progress_percentage: completionPercentage,
          status: completionPercentage >= 100 ? 'completed' : 
                  completionPercentage > 0 ? 'in_progress' : 'not_started',
          started_at: completionPercentage > 0 ? new Date().toISOString() : null,
          completed_at: completionPercentage >= 100 ? new Date().toISOString() : null
        })
        .eq('course_id', courseId)
        .eq('user_id', userId);
      
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
