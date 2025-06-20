
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Clock, Award, Play, CheckCircle, Video, Users, AlertCircle } from 'lucide-react';
import { useCourses } from '@/hooks/useCourses';
import { useCourseEnrollments, useAutoEnrollInPublishedCourses } from '@/hooks/useEnrollments';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAuthDebug } from '@/hooks/useAuthDebug';

const Courses = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const authDebug = useAuthDebug();
  
  console.log('🎯 Courses component - Auth Context:', { user, loading });
  console.log('🎯 Courses component - Auth Debug:', authDebug);
  
  const { data: courses, isLoading: coursesLoading, error, refetch: refetchCourses } = useCourses();
  console.log('🔍 RAW COURSES DATA:', courses);
  console.log('🔍 COURSES LOADING:', coursesLoading);
  console.log('🔍 COURSES ERROR:', error);

  const { data: enrollments, refetch: refetchEnrollments } = useCourseEnrollments(user?.id);
  console.log('🔍 RAW ENROLLMENTS DATA:', enrollments);
  
  // Auto-enroll in published courses
  const { data: autoEnrolledCourses, isSuccess: autoEnrollSuccess } = useAutoEnrollInPublishedCourses(user?.id);
  console.log('🔍 AUTO-ENROLLED COURSES:', autoEnrolledCourses, 'success:', autoEnrollSuccess);

  // Refresh enrollments when auto-enrollment happens
  useEffect(() => {
    if (autoEnrollSuccess && autoEnrolledCourses && autoEnrolledCourses.length > 0) {
      console.log('Auto-enrollment completed, refetching enrollments');
      refetchEnrollments();
    }
  }, [autoEnrollSuccess, autoEnrolledCourses, refetchEnrollments]);

  // Filter published courses and ensure proper data structure
  const publishedCourses = React.useMemo(() => {
    console.log('🔍 PROCESSING COURSES FOR FILTERING...');
    
    if (!courses || !Array.isArray(courses)) {
      console.log('❌ No courses data available or not an array:', courses);
      return [];
    }
    
    console.log(`🔍 Total courses received: ${courses.length}`);
    courses.forEach((course, index) => {
      console.log(`🔍 Course ${index + 1}:`, {
        id: course?.id,
        title: course?.title,
        status: course?.status,
        hasRequiredFields: !!(course?.id && course?.title)
      });
    });
    
    const published = courses.filter(course => {
      // Ensure course has required properties
      if (!course || !course.id || !course.title) {
        console.warn('❌ Invalid course data (missing id or title):', course);
        return false;
      }
      
      const isPublished = course.status === 'published';
      console.log(`📚 Course "${course.title}" (${course.id}) - Status: "${course.status}", Published: ${isPublished}`);
      return isPublished;
    });
    
    console.log(`✅ Final published courses for learners: ${published.length}`, published);
    return published;
  }, [courses]);

  // Create a map of course enrollments for quick lookup
  const enrollmentMap = new Map();
  if (enrollments && Array.isArray(enrollments)) {
    enrollments.forEach(enrollment => {
      if (enrollment?.courses?.id) {
        enrollmentMap.set(enrollment.courses.id, enrollment);
        console.log(`📝 Mapped enrollment for course ${enrollment.courses.id}:`, enrollment);
      } else {
        console.warn('❌ Invalid enrollment data (missing course ID):', enrollment);
      }
    });
  }
  console.log('🗂️ Enrollment map size:', enrollmentMap.size);
  console.log('🗂️ Enrollment map entries:', Array.from(enrollmentMap.entries()));

  const formatDuration = (durationHours: number) => {
    if (!durationHours || durationHours <= 0) return '30 min';
    
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
    navigate(`/learner/courses/${course.id}`);
  };

  const getEnrollmentStatus = (course: any) => {
    const enrollment = enrollmentMap.get(course.id);
    console.log(`🎯 Getting enrollment status for course ${course.id}:`, enrollment);
    
    if (!enrollment) {
      console.log(`❌ No enrollment found for course ${course.id}`);
      return { status: 'not_enrolled', progress: 0 };
    }
    
    const result = {
      status: enrollment.status || 'not_started',
      progress: enrollment.progress_percentage || 0
    };
    console.log(`✅ Enrollment status for course ${course.id}:`, result);
    return result;
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

  const handleRetryFetch = () => {
    console.log('🔄 Manual retry triggered');
    refetchCourses();
  };

  // Calculate summary statistics
  const enrolledCourses = enrollments?.length || 0;
  const completedCourses = enrollments?.filter(e => e.status === 'completed').length || 0;
  const inProgressCourses = enrollments?.filter(e => e.status === 'in_progress').length || 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (coursesLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error in courses component:', error);
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-muted-foreground">Error loading courses</p>
            <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
            <Button onClick={handleRetryFetch} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, showing login prompt');
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground">Please log in to view courses</p>
            <Button onClick={() => navigate('/login')} className="mt-4">
              Go to Login
            </Button>
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
          <CardTitle>My Learning Progress</CardTitle>
          <CardDescription>Your learning journey across available courses</CardDescription>
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

      {/* Enhanced Debug Information */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="font-bold mb-2 text-blue-800">Enhanced Debug Information:</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Auth Context - User ID:</strong> {user?.id}</p>
          <p><strong>Auth Context - User Email:</strong> {user?.email}</p>
          <p><strong>Auth Debug - Has Session:</strong> {authDebug.hasSession ? 'Yes' : 'No'}</p>
          <p><strong>Auth Debug - Has User:</strong> {authDebug.hasUser ? 'Yes' : 'No'}</p>
          <p><strong>Auth Debug - Session Valid:</strong> {authDebug.sessionValid ? 'Yes' : 'No'}</p>
          <p><strong>Auth Debug - Error:</strong> {authDebug.error || 'None'}</p>
          <p><strong>Raw Courses:</strong> {courses?.length || 0} total</p>
          <p><strong>Published Courses:</strong> {publishedCourses.length}</p>
          <p><strong>Raw Enrollments:</strong> {enrollments?.length || 0}</p>
          <p><strong>Enrollment Map Size:</strong> {enrollmentMap.size}</p>
          <p><strong>Auto-enroll Success:</strong> {autoEnrollSuccess ? 'Yes' : 'No'}</p>
          <p><strong>Auto-enrolled Courses:</strong> {autoEnrolledCourses?.length || 0}</p>
          <p><strong>Courses Loading:</strong> {coursesLoading ? 'Yes' : 'No'}</p>
          <p><strong>Error Present:</strong> {error ? 'Yes' : 'No'}</p>
          {error && <p><strong>Error Message:</strong> {error.message}</p>}
          
          {courses && courses.length > 0 && (
            <div className="mt-2">
              <p><strong>Course Details:</strong></p>
              {courses.map((course, index) => (
                <div key={course?.id || index} className="ml-4 text-xs">
                  • {course?.title || 'No title'} - Status: {course?.status || 'No status'} - ID: {course?.id || 'No ID'}
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-2">
            <Button onClick={handleRetryFetch} size="sm" className="bg-blue-600 hover:bg-blue-700">
              🔄 Force Refresh Courses
            </Button>
          </div>
        </div>
      </Card>

      {/* Courses Grid with Scrolling */}
      <ScrollArea className="h-[calc(100vh-500px)]">
        {publishedCourses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Published Courses Available</h3>
            <p className="text-muted-foreground">Check back later for new courses or contact your administrator.</p>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                <strong>Debug Info:</strong> Total courses in system: {courses?.length || 0} | 
                Published: {publishedCourses.length} | 
                Courses loading: {coursesLoading ? 'Yes' : 'No'} |
                Auth Session Valid: {authDebug.sessionValid ? 'Yes' : 'No'}
              </p>
              {courses && courses.length > 0 && (
                <p className="text-xs text-yellow-600 mt-2">
                  Available courses: {courses.map(c => `"${c?.title}" (${c?.status})`).join(', ')}
                </p>
              )}
              {authDebug.error && (
                <p className="text-xs text-red-600 mt-2">
                  Auth Error: {authDebug.error}
                </p>
              )}
            </div>
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
    </div>
  );
};

export default Courses;
