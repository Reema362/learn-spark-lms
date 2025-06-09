
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Award, Play, CheckCircle } from 'lucide-react';

const Courses = () => {
  const courses = [
    {
      id: 1,
      title: "Cybersecurity Fundamentals",
      description: "Learn the basics of cybersecurity including threat identification, risk assessment, and security best practices.",
      progress: 75,
      status: "in-progress",
      duration: "4 hours",
      modules: 8,
      completedModules: 6,
      dueDate: "2024-01-15",
      category: "Security Basics"
    },
    {
      id: 2,
      title: "Phishing Awareness Training",
      description: "Understand how to identify and prevent phishing attacks, email security, and social engineering tactics.",
      progress: 100,
      status: "completed",
      duration: "2 hours",
      modules: 5,
      completedModules: 5,
      completedDate: "2024-01-10",
      category: "Email Security"
    },
    {
      id: 3,
      title: "Data Protection and Privacy",
      description: "Learn about data classification, privacy regulations (GDPR, CCPA), and secure data handling practices.",
      progress: 0,
      status: "not-started",
      duration: "3 hours",
      modules: 6,
      completedModules: 0,
      dueDate: "2024-02-01",
      category: "Data Security"
    },
    {
      id: 4,
      title: "Incident Response Procedures",
      description: "Master the steps for identifying, containing, and responding to security incidents effectively.",
      progress: 40,
      status: "in-progress",
      duration: "5 hours",
      modules: 10,
      completedModules: 4,
      dueDate: "2024-01-25",
      category: "Incident Management"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-success text-success-foreground">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-warning text-warning-foreground">In Progress</Badge>;
      case 'not-started':
        return <Badge variant="secondary">Not Started</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getActionButton = (course: any) => {
    switch (course.status) {
      case 'completed':
        return (
          <Button variant="outline" size="sm">
            <Award className="h-4 w-4 mr-2" />
            View Certificate
          </Button>
        );
      case 'in-progress':
        return (
          <Button size="sm">
            <Play className="h-4 w-4 mr-2" />
            Continue
          </Button>
        );
      case 'not-started':
        return (
          <Button size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Start Course
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">My Courses</h2>
          <p className="text-muted-foreground">Continue your information security learning journey</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Overall Progress</p>
          <p className="text-2xl font-bold">54%</p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Learning Progress Overview</CardTitle>
          <CardDescription>Your progress across all assigned courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">1</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">2</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">1</div>
              <div className="text-sm text-muted-foreground">Not Started</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">4</div>
              <div className="text-sm text-muted-foreground">Total Assigned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="dashboard-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="mt-2">{course.description}</CardDescription>
                </div>
                {getStatusBadge(course.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              {course.status !== 'not-started' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{course.completedModules} of {course.modules} modules completed</span>
                  </div>
                </div>
              )}

              {/* Course Details */}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.duration}
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {course.modules} modules
                </div>
              </div>

              {/* Category */}
              <Badge variant="outline" className="w-fit">
                {course.category}
              </Badge>

              {/* Due Date or Completion Date */}
              {course.status === 'completed' && course.completedDate && (
                <div className="flex items-center text-sm text-success">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completed on {new Date(course.completedDate).toLocaleDateString()}
                </div>
              )}

              {course.status !== 'completed' && course.dueDate && (
                <div className="text-sm text-muted-foreground">
                  Due: {new Date(course.dueDate).toLocaleDateString()}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                {getActionButton(course)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Courses;
