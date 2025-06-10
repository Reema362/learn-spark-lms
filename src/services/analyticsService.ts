
import { supabase } from '@/integrations/supabase/client';

export class AnalyticsService {
  static async getAnalytics() {
    const [coursesResult, usersResult, enrollmentsResult] = await Promise.all([
      supabase.from('courses').select('id, status'),
      supabase.from('profiles').select('id, role'),
      supabase.from('course_enrollments').select('id, status, progress_percentage')
    ]);

    const totalCourses = coursesResult.data?.length || 0;
    const activeCourses = coursesResult.data?.filter(c => c.status === 'published').length || 0;
    const totalUsers = usersResult.data?.length || 0;
    const activeUsers = usersResult.data?.filter(u => u.role !== 'admin').length || 0;
    const totalEnrollments = enrollmentsResult.data?.length || 0;
    const completedEnrollments = enrollmentsResult.data?.filter(e => e.status === 'completed').length || 0;
    const averageProgress = enrollmentsResult.data?.reduce((acc, e) => acc + (e.progress_percentage || 0), 0) / (enrollmentsResult.data?.length || 1) || 0;

    return {
      totalCourses,
      activeCourses,
      totalUsers,
      activeUsers,
      totalEnrollments,
      completedEnrollments,
      averageProgress,
      recentActivity: []
    };
  }
}
