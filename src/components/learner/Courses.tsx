import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Clock, Award, Play, CheckCircle, Video, Users } from 'lucide-react';
import { useCourses } from '@/hooks/useCourses';
import { useCourseEnrollments } from '@/hooks/useEnrollments';
import CourseViewer from './CourseViewer';

const Courses = () => {
  const { data: courses, isLoading, error } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseViewerOpen, setCourseViewerOpen] = useState(false);

  // Get current user with improved fallback for cross-device sync
  const getCurrentUser = () => {
    // First check for Supabase auth
    const authToken = localStorage.getItem('supabase.auth.token');
    if (authToken) {
      try {
        const parsedToken = JSON.parse(authToken);
        if (parsedToken?.user) {
          return parsedToken.user;
        }
      } catch (e) {
        console.log('Error parsing supabase token:', e);
      }
    }
    
    // Then check for app session (demo mode) - ensure cross-device consistency
    const demoUser = localStorage.getItem('avocop_user');
    if (demoUser) {
      try {
        const parsedUser = JSON.parse(demoUser);
        if (parsedUser && parsedUser.id) {
          // Ensure user data is synced across devices for demo mode
          const sharedUserData = localStorage.getItem(`shared-user-${parsedUser.email}`);
          if (sharedUserData) {
            const syncedUser = JSON.parse(sharedUserData);
            return { ...parsedUser, ...syncedUser };
          } else {
            // Store user data for cross-device sync
            localStorage.setItem(`shared-user-${parsedUser.email}`, JSON.stringify(parsedUser));
          }
          return parsedUser;
        }
      } catch (e) {
        console.log('Error parsing demo user:', e);
      }
    }
    
    return null;
  };

  const currentUser = getCurrentUser();
  console.log('Current user in learner courses:', currentUser);
  console.log('All courses:', courses);
  
  const { data: enrollments } = useCourseEnrollments(currentUser?.id);

  // Filter only published courses for learners and log the filtering process
  const publishedCourses = courses?.filter(course => {
    const isPublished = course.status === 'published';
    console.log(`Course "${course.title}" status: ${course.status}, published: ${isPublished}`);
    return isPublished;
  }) || [];

  console.log('Published courses for learner:', publishedCourses);

  // Create a map of course enrollments for quick lookup with cross-device sync
  const enrollmentMap = new Map();
  
  // For demo mode, also check shared enrollment data
  if (currentUser && !enrollments) {
    const sharedEnrollments = localStorage.getItem(`shared-enrollments-${currentUser.email}`);
    if (sharedEnrollments) {
      const parsedEnrollments = JSON.parse(sharedEnrollments);
      parsedEnrollments.forEach((enrollment: any) => {
        enrollmentMap.set(enrollment.course_id, enrollment);
      });
    }
  } else {
    enrollments?.forEach(enrollment => {
      enrollmentMap.set(enrollment.course_id, enrollment);
    });
  }

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

  const getEnrollmentStatus = (course: any) => {
    const enrollment = enrollmentMap.get(course.id);
    if (!enrollment) return { status: 'not_enrolled', progress: 0 };
    
    return {
      status: enrollment.status,
      progress: enrollment.progress_percentage || 0
    };
  };

  const getStatusBadge = (course: any) => {
    const { status, progress } = getEnrollmentStatus(course);
    
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-700">In Progress</Badge>;
      case 'not_started':
        return <Badge variant="outline">Enrolled</Badge>;
      default:
        return <Badge variant="default" className="bg-primary text-primary-foreground">Available</Badge>;
    }
  };

  const getActionButton = (course: any) => {
    const { status, progress } = getEnrollmentStatus(course);
    
    if (status === 'completed') {
      return (
        <Button size="sm" onClick={() => handleViewCourse(course)} variant="outline">
          <CheckCircle className="h-4 w-4 mr-2" />
          Review Course
        </Button>
      );
    }
    
    if (status === 'in_progress') {
      return (
        <Button size="sm" onClick={() => handleViewCourse(course)}>
          <Play className="h-4 w-4 mr-2" />
          Continue ({progress}%)
        </Button>
      );
    }
    
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

  // Calculate summary statistics with cross-device sync
  const enrolledCourses = enrollments?.length || enrollmentMap.size || 0;
  const completedCourses = enrollments?.filter(e => e.status === 'completed').length || 
    Array.from(enrollmentMap.values()).filter((e: any) => e.status === 'completed').length || 0;
  const inProgressCourses = enrollments?.filter(e => e.status === 'in_progress').length || 
    Array.from(enrollmentMap.values()).filter((e: any) => e.status === 'in_progress').length || 0;

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
    console.error('Error loading courses:', error);
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground">Error loading courses</p>
            <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Debug output
  console.log('Total courses:', courses?.length || 0);
  console.log('Published courses:', publishedCourses.length);

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
          <CardTitle>My Learning Progress</CardTitle>
          <CardDescription>Your learning journey across available courses (synced across all devices)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{completedCourses}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{inProgressCourses}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">{enrolledCourses}</div>
              <div className="text-sm text-muted-foreground">Enrolled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{publishedCourses.length}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
          </div>
          
          {/* Overall Progress Bar */}
          {enrolledCourses > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Completion</span>
                <span>{Math.round((completedCourses / enrolledCourses) * 100)}%</span>
              </div>
              <Progress value={(completedCourses / enrolledCourses) * 100} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Courses Grid with Scrolling */}
      <ScrollArea className="h-[calc(100vh-400px)]">
        {publishedCourses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Published Courses Available</h3>
            <p className="text-muted-foreground">
              {courses?.length > 0 
                ? "Courses are available but not yet published. Contact your administrator." 
                : "Check back later for new courses."
              }
            </p>
            {courses?.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Total courses in system: {courses.length}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            {publishedCourses.map((course) => {
              const { status, progress } = getEnrollmentStatus(course);
              
              return (
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

                    {/* Progress Bar for enrolled courses */}
                    {progress > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

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
              );
            })}
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
