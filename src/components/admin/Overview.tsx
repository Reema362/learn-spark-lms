
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { useAnalytics, useCourses, useUsers } from '@/hooks/useDatabase';

const Overview = () => {
  const { data: analytics } = useAnalytics();
  const { data: courses = [] } = useCourses();
  const { data: users = [] } = useUsers();

  const stats = [
    {
      title: "Total Users",
      value: analytics?.totalUsers || 0,
      change: "+12%",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Active Courses",
      value: analytics?.activeCourses || 0,
      change: "+3",
      icon: BookOpen,
      color: "text-accent"
    },
    {
      title: "Total Enrollments",
      value: analytics?.totalEnrollments || 0,
      change: "+2",
      icon: Target,
      color: "text-info"
    },
    {
      title: "Avg Progress",
      value: `${Math.round(analytics?.averageProgress || 0)}%`,
      change: "+5%",
      icon: TrendingUp,
      color: "text-success"
    }
  ];

  const recentActivity = [
    { action: "New user registered", time: "2 hours ago", type: "user" },
    { action: "Course 'Security Basics' published", time: "4 hours ago", type: "course" },
    { action: "15 users enrolled in courses", time: "6 hours ago", type: "enrollment" },
    { action: "Assessment completed", time: "1 day ago", type: "assessment" },
  ];

  const pendingTasks = [
    { task: "Review new course submissions", count: 3, priority: "high" },
    { task: "Update user permissions", count: 2, priority: "medium" },
    { task: "Process course completions", count: 5, priority: "low" },
  ];

  // Get top courses by status
  const publishedCourses = courses.filter((course: any) => course.status === 'published').slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-success font-medium">{stat.change} from last month</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Overview */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Published Courses</CardTitle>
            <CardDescription>Active courses on the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {publishedCourses.length > 0 ? (
              publishedCourses.map((course: any) => (
                <div key={course.id} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{course.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {course.duration_hours}h
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={75} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground">75%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No published courses yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system updates and user actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-2">
                    {task.priority === 'high' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    {task.priority === 'medium' && <CheckCircle className="h-4 w-4 text-warning" />}
                    {task.priority === 'low' && <CheckCircle className="h-4 w-4 text-success" />}
                    <span className="text-sm font-medium">{task.task}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({task.count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-medium">Create New Course</span>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-accent" />
                <span className="font-medium">Add Users</span>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-info/5 hover:bg-info/10 transition-colors">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-info" />
                <span className="font-medium">Manage Enrollments</span>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
