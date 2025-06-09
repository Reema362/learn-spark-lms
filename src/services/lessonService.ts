
import { supabase } from '@/integrations/supabase/client';

export class LessonService {
  static async getLessonsForCourse(courseId: string) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');
    
    if (error) throw error;
    return data;
  }

  static async createLesson(lesson: {
    course_id: string;
    title: string;
    content?: string;
    video_url?: string;
    document_url?: string;
    type?: 'text' | 'video' | 'quiz' | 'assignment';
    duration_minutes?: number;
    order_index?: number;
    is_required?: boolean;
  }) {
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        course_id: lesson.course_id,
        title: lesson.title,
        content: lesson.content,
        video_url: lesson.video_url,
        document_url: lesson.document_url,
        type: lesson.type,
        duration_minutes: lesson.duration_minutes,
        order_index: lesson.order_index || 0,
        is_required: lesson.is_required
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateLesson(id: string, updates: any) {
    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
