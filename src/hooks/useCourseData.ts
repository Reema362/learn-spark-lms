
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCourseData = (courseId: string | undefined) => {
  const [userId, setUserId] = useState<string>('');
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonProgress, setLessonProgress] = useState<Record<string, number>>({});

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        // Check for demo user in localStorage
        const demoUser = localStorage.getItem('avocop_user');
        if (demoUser) {
          const parsedUser = JSON.parse(demoUser);
          setUserId(parsedUser.id);
        }
      }
    };
    getCurrentUser();
  }, []);

  // Get lessons for the course
  useEffect(() => {
    const loadLessons = async () => {
      if (!courseId) return;

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Load from Supabase
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index');

        if (!error && data) {
          setLessons(data);
        }
      } else {
        // Load from localStorage for demo mode
        const demoLessons = JSON.parse(localStorage.getItem('demo-lessons') || '[]');
        const courseLessons = demoLessons
          .filter((lesson: any) => lesson.course_id === courseId)
          .sort((a: any, b: any) => a.order_index - b.order_index);
        
        setLessons(courseLessons);
      }
    };

    loadLessons();
  }, [courseId]);

  // Load lesson progress
  useEffect(() => {
    const loadProgress = async () => {
      if (!userId || !courseId) return;

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Load from Supabase
        const { data } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', userId);

        if (data) {
          const progressMap: Record<string, number> = {};
          data.forEach((p: any) => {
            progressMap[p.lesson_id] = p.progress_percentage;
          });
          setLessonProgress(progressMap);
        }
      } else {
        // Load from localStorage for demo mode
        const demoProgress = JSON.parse(localStorage.getItem('demo-lesson-progress') || '[]');
        const userProgress = demoProgress.filter((p: any) => p.user_id === userId);
        
        const progressMap: Record<string, number> = {};
        userProgress.forEach((p: any) => {
          progressMap[p.lesson_id] = p.progress_percentage;
        });
        setLessonProgress(progressMap);
      }
    };

    loadProgress();
  }, [userId, courseId]);

  const updateLessonProgress = (lessonId: string, progress: number) => {
    setLessonProgress(prev => ({
      ...prev,
      [lessonId]: progress
    }));
  };

  return {
    userId,
    lessons,
    lessonProgress,
    updateLessonProgress
  };
};
