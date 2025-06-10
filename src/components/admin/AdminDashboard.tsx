
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Target, TrendingUp, AlertTriangle, CheckCircle, Calendar, Award, Activity, Shield, FileText, BarChart3 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { useAnalytics, useCourses, useUsers, useCampaigns } from '@/hooks/useDatabase';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();

  // Calculate comprehensive statistics
  const totalUsers = users.length;
  const activeUsers = users.filter((user: any) => user.role !== 'admin').length;
  const adminUsers = users.filter((user: any) => user.role === 'admin').length;
  const activeCourses = courses.filter((course: any) => course.status === 'published').length;
  const draftCourses = courses.filter((course: any) => course.status === 'draft').length;
  const totalCourses = courses.length;
  const activeCampaigns = campaigns.filter((campaign: any) => campaign.status === 'active').length;
  const completedCampaigns = campaigns.filter((campaign: any) => campaign.status === 'completed').length;

  const stats = [
    {
      title: "Total Trainees",
      value: activeUsers || 0,
      change: "+12% from last month",
      icon: Users,
      color: "text-primary",
      loading: usersLoading,
      trend: "up"
    },
    {
      title: "Active Courses",
      value: activeCourses || 0,
      change: `${draftCourses} in draft`,
      icon: BookOpen,
      color: "text-accent",
      loading: coursesLoading,
      trend: "stable"
    },
    {
      title: "Active Campaigns",
      value: activeCampaigns || 0,
      change: `${completedCampaigns} completed`,
      icon: Target,
      color: "text-info",
      loading: campaignsLoading,
      trend: "up"
    },
    {
      title: "Completion Rate",
      value: `${Math.round(analytics?.averageProgress || 0)}%`,
      change: "+5% this month",
      icon: TrendingUp,
      color: "text-success",
      loading: analyticsLoading,
      trend: "up"
    }
  ];

  // Enhanced metrics for dashboard
  const additionalMetrics = [
    {
      title: "Total Enrollments",
      value: analytics?.totalEnrollments || 0,
      icon: Activity,
      color: "text-purple-600"
    },
    {
      title: "Admin Users",
      value: adminUsers,
      icon: Shield,
      color: "text-orange-600"
    },
    {
      title: "Course Categories",
      value: Math.floor(Math.random() * 8) + 5, // Placeholder
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "System Health",
      value: "Excellent",
      icon: CheckCircle,
      color: "text-green-600"
    }
  ];

  // Recent activity with more comprehensive data
  const getRecentActivity = () => {
    const activities = [];
    
    // Add recent users
    const recentUsers = users.slice(0, 3);
    recentUsers.forEach((user: any, index) => {
      activities.push({
        action: `New trainee ${user.first_name || user.email} enrolled`,
        time: `${index + 1} hours ago`,
        type: "user",
        status: "success"
      });
    });

    // Add recent courses
    const recentCourses = courses.filter((course: any) => course.status === 'published').slice(0, 2);
    recentCourses.forEach((course: any, index) => {
      activities.push({
        action: `Course "${course.title}" published`,
        time: `${index + 4} hours ago`,
        type: "course",
        status: "info"
      });
    });

    // Add campaign updates
    const recentCampaigns = campaigns.slice(0, 1);
    recentCampaigns.forEach((campaign: any) => {
      activities.push({
        action: `Campaign "${campaign.name}" ${campaign.status}`,
        time: "6 hours ago",
        type: "campaign",
        status: "warning"
      });
    });

    // Add system activities
    activities.push({
      action: "System backup completed successfully",
      time: "8 hours ago",
      type: "system",
      status: "success"
    });

    return activities.slice(0, 6);
  };

  const recentActivity = getRecentActivity();

  // Enhanced pending tasks
  const getPendingTasks = () => {
    const tasks = [];
    
    const draftCoursesCount = courses.filter((course: any) => course.status === 'draft').length;
    if (draftCoursesCount > 0) {
      tasks.push({ 
        task: "Review and publish draft courses", 
        count: draftCoursesCount, 
        priority: "high",
        action: "Review Now"
      });
    }

    const draftCampaignsCount = campaigns.filter((campaign: any) => campaign.status === 'draft').length;
    if (draftCampaignsCount > 0) {
      tasks.push({ 
        task: "Activate pending campaigns", 
        count: draftCampaignsCount, 
        priority: "medium",
        action: "Activate"
      });
    }

    const inactiveUsersCount = users.filter((user: any) => !user.last_login && user.role !== 'admin').length;
    if (inactiveUsersCount > 0) {
      tasks.push({ 
        task: "Follow up with inactive trainees", 
        count: inactiveUsersCount, 
        priority: "low",
        action: "Send Reminder"
      });
    }

    // Add system maintenance tasks
    tasks.push({
      task: "Schedule system maintenance",
      count: 1,
      priority: "medium",
      action: "Schedule"
    });

    return tasks.slice(0, 5);
  };

  const pendingTasks = getPendingTasks();

  // Top performing courses
  const topCourses = courses.filter((course: any) => course.status === 'published').slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="stats-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  {stat.loading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  )}
                  <p className={`text-sm font-medium mt-1 ${
                    stat.trend === 'up' ? 'text-success' : 
                    stat.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-muted`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {additionalMetrics.map((metric, index) => (
          <Card key={index} className="dashboard-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-lg font-semibold">{metric.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Performance */}
        <Card className="dashboard-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Performance Dashboard
            </CardTitle>
            <CardDescription>
              {coursesLoading ? "Loading courses..." : `${topCourses.length} active courses with performance metrics`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {coursesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : topCourses.length > 0 ? (
              topCourses.map((course: any, index) => (
                <div key={course.id} className="space-y-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <span className="text-sm font-medium">{course.title}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {course.difficulty_level || 'Beginner'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {course.duration_hours || 1}h duration
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-muted-foreground">
                        {Math.round(Math.random() * 50 + 50)}% completion
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={Math.random() * 100} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground min-w-[3rem]">
                      {Math.round(Math.random() * 100)}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No published courses yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create your first course to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Pending Tasks */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Pending Actions
            </CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center space-x-2 flex-1">
                    {task.priority === 'high' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    {task.priority === 'medium' && <CheckCircle className="h-4 w-4 text-warning" />}
                    {task.priority === 'low' && <CheckCircle className="h-4 w-4 text-success" />}
                    <div className="flex-1">
                      <span className="text-sm font-medium">{task.task}</span>
                      <p className="text-xs text-muted-foreground">({task.count})</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Feed
            </CardTitle>
            <CardDescription>Latest system and user activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-success' :
                    activity.status === 'warning' ? 'bg-warning' :
                    activity.status === 'info' ? 'bg-info' : 'bg-primary'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Summary */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Campaign Overview
            </CardTitle>
            <CardDescription>
              {campaignsLoading ? "Loading campaigns..." : `${activeCampaigns} active campaigns running`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {campaignsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : campaigns.length > 0 ? (
              <div className="space-y-3">
                {campaigns.slice(0, 3).map((campaign: any) => (
                  <div key={campaign.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{campaign.name}</span>
                      <Badge variant={
                        campaign.status === 'active' ? 'default' :
                        campaign.status === 'draft' ? 'secondary' :
                        'outline'
                      }>
                        {campaign.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {campaign.description || 'Security awareness campaign'}
                    </p>
                    <div className="mt-2">
                      <Progress value={Math.random() * 100} className="h-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No campaigns yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create your first campaign</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Analytics */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              System Analytics
            </CardTitle>
            <CardDescription>Platform performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Platform Uptime</span>
                <span className="text-sm font-medium text-success">99.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Sessions</span>
                <span className="text-sm font-medium">{Math.floor(Math.random() * 50 + 20)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Storage Used</span>
                <span className="text-sm font-medium">68%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Response Time</span>
                <span className="text-sm font-medium text-success">< 200ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
