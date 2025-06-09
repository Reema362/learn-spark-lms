
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Users, Clock, Award } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Analytics & Reporting</h2>
          <p className="text-muted-foreground">Detailed insights into learning performance</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Reports
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Learners</p>
                <p className="text-2xl font-bold">1,284</p>
                <p className="text-sm text-success font-medium">+12% this month</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">89%</p>
                <p className="text-sm text-success font-medium">+5% this month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Time Spent</p>
                <p className="text-2xl font-bold">4.2h</p>
                <p className="text-sm text-success font-medium">+0.3h this month</p>
              </div>
              <Clock className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certificates Issued</p>
                <p className="text-2xl font-bold">947</p>
                <p className="text-sm text-success font-medium">+67 this month</p>
              </div>
              <Award className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Performance */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>Completion rates by course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Cybersecurity Fundamentals", completion: 92, enrolled: 234 },
                { name: "Phishing Awareness", completion: 87, enrolled: 189 },
                { name: "Data Protection", completion: 74, enrolled: 145 },
                { name: "Incident Response", completion: 65, enrolled: 98 }
              ].map((course, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{course.name}</span>
                    <span>{course.completion}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${course.completion}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(course.enrolled * course.completion / 100)} of {course.enrolled} learners completed
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learner Activity */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Learner Activity</CardTitle>
            <CardDescription>Recent learning activity trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">142</div>
                  <div className="text-sm text-muted-foreground">Active Today</div>
                </div>
                <div className="p-4 bg-success/5 rounded-lg">
                  <div className="text-2xl font-bold text-success">89</div>
                  <div className="text-sm text-muted-foreground">Completed Today</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Top Performing Departments</h4>
                {[
                  { dept: "IT Security", completion: 94 },
                  { dept: "Human Resources", completion: 91 },
                  { dept: "Finance", completion: 87 },
                  { dept: "Marketing", completion: 82 }
                ].map((dept, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{dept.dept}</span>
                    <span className="text-sm font-medium">{dept.completion}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
            <CardDescription>Time spent and interaction data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold">4.2h</div>
                  <div className="text-xs text-muted-foreground">Avg. Session</div>
                </div>
                <div>
                  <div className="text-lg font-bold">12.5</div>
                  <div className="text-xs text-muted-foreground">Pages/Session</div>
                </div>
                <div>
                  <div className="text-lg font-bold">78%</div>
                  <div className="text-xs text-muted-foreground">Retention Rate</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Content Engagement</h4>
                {[
                  { type: "Videos", engagement: 92 },
                  { type: "Interactive Quizzes", engagement: 87 },
                  { type: "Documents", engagement: 74 },
                  { type: "Simulations", engagement: 68 }
                ].map((content, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{content.type}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-accent h-2 rounded-full" 
                          style={{ width: `${content.engagement}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8">{content.engagement}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Generation */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Report Generation</CardTitle>
            <CardDescription>Generate detailed reports for analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Learner Progress Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Course Effectiveness Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Completion Certificate Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Department Analysis Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Custom Date Range Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
