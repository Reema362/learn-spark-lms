
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

const Overview = () => {
  const stats = [
    {
      title: "Total Users",
      value: "1,284",
      change: "+12%",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Active Courses",
      value: "47",
      change: "+3",
      icon: BookOpen,
      color: "text-accent"
    },
    {
      title: "Running Campaigns",
      value: "8",
      change: "+2",
      icon: Target,
      color: "text-info"
    },
    {
      title: "Completion Rate",
      value: "89%",
      change: "+5%",
      icon: TrendingUp,
      color: "text-success"
    }
  ];

  const recentActivity = [
    { action: "New course 'Phishing Awareness' created", time: "2 hours ago", type: "course" },
    { action: "Campaign 'Q4 Security Training' launched", time: "4 hours ago", type: "campaign" },
    { action: "15 users completed 'Data Protection Basics'", time: "6 hours ago", type: "completion" },
    { action: "Support ticket #127 resolved", time: "1 day ago", type: "support" },
  ];

  const pendingTasks = [
    { task: "Review escalated tickets", count: 3, priority: "high" },
    { task: "Approve new course content", count: 2, priority: "medium" },
    { task: "Update campaign assignments", count: 5, priority: "low" },
  ];

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
        {/* Course Completion Overview */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Course Completion Overview</CardTitle>
            <CardDescription>Progress across all active courses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Cybersecurity Fundamentals</span>
                <span className="text-sm text-muted-foreground">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Phishing Awareness</span>
                <span className="text-sm text-muted-foreground">87%</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Data Protection</span>
                <span className="text-sm text-muted-foreground">74%</span>
              </div>
              <Progress value={74} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Incident Response</span>
                <span className="text-sm text-muted-foreground">65%</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
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
                <span className="font-medium">Launch Campaign</span>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
