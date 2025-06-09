
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, Clock, FileText } from 'lucide-react';

const CourseManagement = () => {
  const courses = [
    {
      id: 1,
      title: "Cybersecurity Fundamentals",
      description: "Comprehensive introduction to cybersecurity principles and practices",
      category: "Security Basics",
      duration: "4 hours",
      modules: 8,
      enrollments: 234,
      completions: 187,
      status: "active",
      created: "2023-11-15",
      lastUpdated: "2024-01-10"
    },
    {
      id: 2,
      title: "Phishing Awareness Training",
      description: "Learn to identify and prevent phishing attacks",
      category: "Email Security",
      duration: "2 hours",
      modules: 5,
      enrollments: 189,
      completions: 156,
      status: "active",
      created: "2023-12-01",
      lastUpdated: "2024-01-08"
    },
    {
      id: 3,
      title: "Data Protection and Privacy",
      description: "Understanding data protection laws and privacy regulations",
      category: "Data Security",
      duration: "3 hours",
      modules: 6,
      enrollments: 145,
      completions: 89,
      status: "draft",
      created: "2024-01-05",
      lastUpdated: "2024-01-12"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Course Management</h2>
          <p className="text-muted-foreground">Create and manage your learning content</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Course
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">47</div>
            <div className="text-sm text-muted-foreground">Total Courses</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success">42</div>
            <div className="text-sm text-muted-foreground">Active Courses</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-warning">3</div>
            <div className="text-sm text-muted-foreground">Draft Courses</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-info">2</div>
            <div className="text-sm text-muted-foreground">Archived</div>
          </CardContent>
        </Card>
      </div>

      {/* Course Content Library */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Course Content Library</CardTitle>
          <CardDescription>Manage reusable content and media assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col">
              <FileText className="h-6 w-6 mb-2" />
              Documents
              <span className="text-xs text-muted-foreground">124 files</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <FileText className="h-6 w-6 mb-2" />
              Videos
              <span className="text-xs text-muted-foreground">89 files</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <FileText className="h-6 w-6 mb-2" />
              Images
              <span className="text-xs text-muted-foreground">156 files</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <FileText className="h-6 w-6 mb-2" />
              Quizzes
              <span className="text-xs text-muted-foreground">23 templates</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>Manage your course catalog</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      {getStatusBadge(course.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                    <Badge variant="outline" className="w-fit">{course.category}</Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{course.modules} modules</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{course.enrollments} enrolled</span>
                  </div>
                  <div className="text-success">
                    {course.completions} completed
                  </div>
                  <div className="text-muted-foreground">
                    {Math.round((course.completions / course.enrollments) * 100)}% completion rate
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Created: {new Date(course.created).toLocaleDateString()} • 
                  Last updated: {new Date(course.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseManagement;
