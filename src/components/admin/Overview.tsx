
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Target, TrendingUp, AlertTriangle, CheckCircle, Calendar, Award } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { useAnalytics, useCourses, useUsers, useCampaigns } from '@/hooks/useDatabase';
import { Skeleton } from "@/components/ui/skeleton";

const Overview = () => {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();

  // Calculate dynamic statistics
  const totalUsers = users.length;
  const activeUsers = users.filter((user: any) => user.role !== 'admin').length;
  const activeCourses = courses.filter((course: any) => course.status === 'published').length;
  const totalCourses = courses.length;
  const activeCampaigns = campaigns.filter((campaign: any) => campaign.status === 'active').length;

  const stats = [
    {
      title: "Total Users",
      value: totalUsers || 0,
      change: "+12%",
      icon: Users,
      color: "text-primary",
      loading: usersLoading
    },
    {
      title: "Active Courses",
      value: activeCourses || 0,
      change: "+3",
      icon: BookOpen,
      color: "text-accent",
      loading: coursesLoading
    },
    {
      title: "Total Enrollments",
      value: analytics?.totalEnrollments || 0,
      change: "+2",
      icon: Target,
      color: "text-info",
      loading: analyticsLoading
    },
    {
      title: "Avg Progress",
      value: `${Math.round(analytics?.averageProgress || 0)}%`,
      change: "+5%",
      icon: TrendingUp,
      color: "text-success",
      loading: analyticsLoading
    }
  ];

  // Recent activity based on real data
  const getRecentActivity = () => {
    const activities = [];
    
    // Add recent users
    const recentUsers = users.slice(0, 2);
    recentUsers.forEach((user: any) => {
      activities.push({
        action: `New user ${user.first_name || user.email} registered`,
        time: "2 hours ago",
        type: "user"
      });
    });

    // Add recent courses
    const recentCourses = courses.filter((course: any) => course.status === 'published').slice(0, 2);
    recentCourses.forEach((course: any) => {
      activities.push({
        action: `Course '${course.title}' published`,
        time: "4 hours ago",
        type: "course"
      });
    });

    // Add recent campaigns
    const recentCampaigns = campaigns.slice(0, 1);
    recentCampaigns.forEach((campaign: any) => {
      activities.push({
        action: `Campaign '${campaign.name}' ${campaign.status}`,
        time: "6 hours ago",
        type: "campaign"
      });
    });

    // Fallback activities if no real data
    if (activities.length === 0) {
      return [
        { action: "System initialized", time: "1 hour ago", type: "system" },
        { action: "Dashboard loaded", time: "2 hours ago", type: "system" },
        { action: "Ready for first users", time: "Today", type: "system" }
      ];
    }

    return activities.slice(0, 4);
  };

  const recentActivity = getRecentActivity();

  // Dynamic pending tasks based on real data
  const getPendingTasks = () => {
    const tasks = [];
    
    const draftCourses = courses.filter((course: any) => course.status === 'draft').length;
    if (draftCourses > 0) {
      tasks.push({ task: "Review draft courses", count: draftCourses, priority: "high" });
    }

    const draftCampaigns = campaigns.filter((campaign: any) => campaign.status === 'draft').length;
    if (draftCampaigns > 0) {
      tasks.push({ task: "Activate draft campaigns", count: draftCampaigns, priority: "medium" });
    }

    const inactiveUsers = users.filter((user: any) => !user.last_login).length;
    if (inactiveUsers > 0) {
      tasks.push({ task: "Follow up with inactive users", count: inactiveUsers, priority: "low" });
    }

    // Fallback tasks
    if (tasks.length === 0) {
      return [
        { task: "Welcome to your dashboard", count: 1, priority: "low" },
        { task: "Create your first course", count: 1, priority: "medium" },
        { task: "Add users to get started", count: 1, priority: "medium" }
      ];
    }

    return tasks;
  };

  const pendingTasks = getPendingTasks();

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
                  {stat.loading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{stat.value}</p>
                  )}
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
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Published Courses
            </CardTitle>
            <CardDescription>
              {coursesLoading ? "Loading courses..." : `${publishedCourses.length} active courses on the platform`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {coursesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : publishedCourses.length > 0 ? (
              publishedCourses.map((course: any) => (
                <div key={course.id} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{course.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {course.duration_hours || 1}h
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={Math.random() * 100} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground">
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

        {/* Recent Activity */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
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
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Pending Tasks
            </CardTitle>
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

        {/* Campaign Summary */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Campaign Summary
            </CardTitle>
            <CardDescription>
              {campaignsLoading ? "Loading campaigns..." : `${activeCampaigns} active campaigns`}
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
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{campaign.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        campaign.status === 'active' ? 'bg-success/20 text-success' :
                        campaign.status === 'draft' ? 'bg-warning/20 text-warning' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {campaign.description || 'No description available'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No campaigns yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create your first campaign</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
