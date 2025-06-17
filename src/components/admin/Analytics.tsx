
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, BookOpen, Award, Target, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Analytics = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');

  // Fetch real course completion analytics
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['course-analytics', selectedTimeRange],
    queryFn: async () => {
      // Get course completion stats
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses(
            id,
            title,
            course_categories(name, color)
          ),
          profiles(
            first_name,
            last_name,
            department
          )
        `)
        .gte('enrolled_at', new Date(Date.now() - parseInt(selectedTimeRange) * 24 * 60 * 60 * 1000).toISOString());

      if (enrollmentError) throw enrollmentError;

      // Get lesson progress data
      const { data: progress, error: progressError } = await supabase
        .from('lesson_progress')
        .select(`
          *,
          lessons(
            id,
            course_id,
            courses(title)
          )
        `)
        .gte('created_at', new Date(Date.now() - parseInt(selectedTimeRange) * 24 * 60 * 60 * 1000).toISOString());

      if (progressError) throw progressError;

      // Process the data
      const totalEnrollments = enrollments?.length || 0;
      const completedCourses = enrollments?.filter(e => e.status === 'completed').length || 0;
      const inProgress = enrollments?.filter(e => e.status === 'in_progress').length || 0;
      const notStarted = enrollments?.filter(e => e.status === 'not_started').length || 0;
      
      // Calculate completion rate
      const completionRate = totalEnrollments > 0 ? Math.round((completedCourses / totalEnrollments) * 100) : 0;
      
      // Get unique courses and users
      const uniqueCourses = new Set(enrollments?.map(e => e.course_id)).size;
      const uniqueUsers = new Set(enrollments?.map(e => e.user_id)).size;
      
      // Calculate average time spent
      const totalTimeSpent = progress?.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) || 0;
      const avgTimePerUser = uniqueUsers > 0 ? Math.round(totalTimeSpent / uniqueUsers) : 0;

      // Course completion by category
      const categoryStats = enrollments?.reduce((acc: any, enrollment: any) => {
        const category = enrollment.courses?.course_categories?.name || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = { total: 0, completed: 0 };
        }
        acc[category].total++;
        if (enrollment.status === 'completed') {
          acc[category].completed++;
        }
        return acc;
      }, {}) || {};

      const categoryChartData = Object.entries(categoryStats).map(([name, stats]: [string, any]) => ({
        name,
        completed: stats.completed,
        total: stats.total,
        rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
      }));

      // Department analytics
      const departmentStats = enrollments?.reduce((acc: any, enrollment: any) => {
        const dept = enrollment.profiles?.department || 'Unknown';
        if (!acc[dept]) {
          acc[dept] = { enrolled: 0, completed: 0 };
        }
        acc[dept].enrolled++;
        if (enrollment.status === 'completed') {
          acc[dept].completed++;
        }
        return acc;
      }, {}) || {};

      // Status distribution for pie chart
      const statusData = [
        { name: 'Completed', value: completedCourses, color: '#22c55e' },
        { name: 'In Progress', value: inProgress, color: '#f59e0b' },
        { name: 'Not Started', value: notStarted, color: '#6b7280' }
      ];

      // Daily completion trend (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const dailyCompletions = last7Days.map(date => {
        const completions = enrollments?.filter(e => 
          e.completed_at && e.completed_at.startsWith(date)
        ).length || 0;
        return {
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          completions
        };
      });

      return {
        overview: {
          totalEnrollments,
          completedCourses,
          completionRate,
          uniqueCourses,
          uniqueUsers,
          avgTimePerUser
        },
        categoryChartData,
        departmentStats,
        statusData,
        dailyCompletions,
        recentEnrollments: enrollments?.slice(0, 10) || []
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const data = analyticsData || {
    overview: { totalEnrollments: 0, completedCourses: 0, completionRate: 0, uniqueCourses: 0, uniqueUsers: 0, avgTimePerUser: 0 },
    categoryChartData: [],
    departmentStats: {},
    statusData: [],
    dailyCompletions: [],
    recentEnrollments: []
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Learning Analytics</h2>
          <p className="text-muted-foreground">Track course completion and user engagement</p>
        </div>
        <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{data.overview.totalEnrollments}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center mt-1">
              <Users className="h-3 w-3 mr-1" />
              Total Enrollments
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{data.overview.completedCourses}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center mt-1">
              <Award className="h-3 w-3 mr-1" />
              Completed
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{data.overview.completionRate}%</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center mt-1">
              <Target className="h-3 w-3 mr-1" />
              Completion Rate
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{data.overview.uniqueCourses}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center mt-1">
              <BookOpen className="h-3 w-3 mr-1" />
              Active Courses
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{data.overview.uniqueUsers}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center mt-1">
              <Users className="h-3 w-3 mr-1" />
              Active Learners
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-teal-600">{data.overview.avgTimePerUser}m</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center mt-1">
              <Clock className="h-3 w-3 mr-1" />
              Avg. Time/User
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Course Analytics</TabsTrigger>
          <TabsTrigger value="departments">Department View</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Completion Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Status Distribution</CardTitle>
                <CardDescription>Current status of all course enrollments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.statusData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {data.statusData.map((entry: any) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="text-sm">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily Completions Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Completions (Last 7 Days)</CardTitle>
                <CardDescription>Track completion trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.dailyCompletions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="completions" 
                        stroke="#22c55e" 
                        strokeWidth={2}
                        dot={{ fill: '#22c55e' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Enrollments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Enrollments</CardTitle>
              <CardDescription>Latest course enrollments and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {data.recentEnrollments.map((enrollment: any) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{enrollment.courses?.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {enrollment.profiles?.first_name} {enrollment.profiles?.last_name}
                          {enrollment.profiles?.department && ` • ${enrollment.profiles.department}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            enrollment.status === 'completed' ? 'default' :
                            enrollment.status === 'in_progress' ? 'secondary' : 'outline'
                          }
                          className={
                            enrollment.status === 'completed' ? 'bg-green-100 text-green-700' :
                            enrollment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : ''
                          }
                        >
                          {enrollment.status.replace('_', ' ')}
                        </Badge>
                        {enrollment.progress_percentage > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {enrollment.progress_percentage}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {data.recentEnrollments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent enrollments found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Completion by Category</CardTitle>
              <CardDescription>Completion rates across different course categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                    <Bar dataKey="total" fill="#e5e7eb" name="Total Enrolled" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Course engagement by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.departmentStats).map(([dept, stats]: [string, any]) => (
                  <div key={dept} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{dept}</span>
                      <span className="text-sm text-muted-foreground">
                        {stats.completed}/{stats.enrolled} completed
                      </span>
                    </div>
                    <Progress 
                      value={stats.enrolled > 0 ? (stats.completed / stats.enrolled) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                ))}
                {Object.keys(data.departmentStats).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No department data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Trends</CardTitle>
              <CardDescription>Insights into learning patterns and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{data.overview.completionRate}%</div>
                  <div className="text-sm text-muted-foreground">Overall Completion Rate</div>
                  <div className="text-xs text-green-600 mt-1">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    Good engagement
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{data.overview.avgTimePerUser}</div>
                  <div className="text-sm text-muted-foreground">Avg. Minutes per User</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Time investment metric
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {data.overview.uniqueUsers > 0 ? Math.round(data.overview.totalEnrollments / data.overview.uniqueUsers) : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Courses per User</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Learning breadth
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
