
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Clock, Award, Play, CheckCircle, Video, Users } from 'lucide-react';
import { useCourses } from '@/hooks/useCourses';
import CourseViewer from './CourseViewer';

const Courses = () => {
  const { data: courses, isLoading, error } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseViewerOpen, setCourseViewerOpen] = useState(false);

  // Filter only published courses for learners
  const publishedCourses = courses?.filter(course => course.status === 'published') || [];

  const formatDuration = (durationHours: number) => {
    const totalMinutes = durationHours * 60;
    if (totalMinutes < 60) {
      return `${totalMinutes} min`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  const handleViewCourse = (course: any) => {
    setSelectedCourse(course);
    setCourseViewerOpen(true);
  };

  const getStatusBadge = (course: any) => {
    // For learners, we'll show enrollment status or availability
    return <Badge variant="default" className="bg-primary text-primary-foreground">Available</Badge>;
  };

  const getActionButton = (course: any) => {
    return (
      <Button size="sm" onClick={() => handleViewCourse(course)}>
        {course.video_url ? (
          <>
            <Play className="h-4 w-4 mr-2" />
            Start Course
          </>
        ) : (
          <>
            <BookOpen className="h-4 w-4 mr-2" />
            View Course
          </>
        )}
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground">Error loading courses</p>
            <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Available Courses</h2>
          <p className="text-muted-foreground">Explore and learn from our information security courses</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Courses</p>
          <p className="text-2xl font-bold">{publishedCourses.length}</p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Learning Progress Overview</CardTitle>
          <CardDescription>Your learning journey across available courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">0</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">0</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{publishedCourses.length}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{publishedCourses.length}</div>
              <div className="text-sm text-muted-foreground">Total Courses</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid with Scrolling */}
      <ScrollArea className="h-[calc(100vh-400px)]">
        {publishedCourses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Courses Available</h3>
            <p className="text-muted-foreground">Check back later for new courses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            {publishedCourses.map((course) => (
              <Card key={course.id} className="dashboard-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="mt-2">{course.description}</CardDescription>
                    </div>
                    {getStatusBadge(course)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Thumbnail */}
                  {course.thumbnail_url && (
                    <div className="w-full h-32 bg-muted rounded-lg overflow-hidden">
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Course Details */}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDuration(course.duration_hours || 1)}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course.difficulty_level || 'Beginner'}
                    </div>
                    {course.video_url && (
                      <div className="flex items-center">
                        <Video className="h-4 w-4 mr-1" />
                        Video
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  {course.course_categories && (
                    <Badge variant="outline" className="w-fit">
                      {course.course_categories.name}
                    </Badge>
                  )}

                  {/* Mandatory Badge */}
                  {course.is_mandatory && (
                    <Badge variant="outline" className="w-fit bg-warning/10 text-warning border-warning">
                      Required Course
                    </Badge>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    {getActionButton(course)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Course Viewer Modal */}
      {selectedCourse && (
        <CourseViewer
          course={selectedCourse}
          isOpen={courseViewerOpen}
          onClose={() => {
            setCourseViewerOpen(false);
            setSelectedCourse(null);
          }}
        />
      )}
    </div>
  );
};

export default Courses;
