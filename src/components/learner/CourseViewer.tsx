
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, Play, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '@/hooks/useCourses';
import { useCourseEnrollments, useEnrollUserInCourse, useUpdateLessonProgress, useCheckCourseCompletion } from '@/hooks/useEnrollments';
import { supabase } from '@/integrations/supabase/client';
import { StorageService } from '@/services/storageService';

const CourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonProgress, setLessonProgress] = useState<Record<string, number>>({});

  const { data: courses = [] } = useCourses();
  const { data: enrollments = [] } = useCourseEnrollments(userId);
  const enrollMutation = useEnrollUserInCourse();
  const updateProgressMutation = useUpdateLessonProgress();
  const checkCompletionMutation = useCheckCourseCompletion();

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        // Check for demo user in localStorage
        const demoUser = localStorage.getItem('avocop_user');
        if (demoUser) {
          const parsedUser = JSON.parse(demoUser);
          setUserId(parsedUser.id);
        }
      }
    };
    getCurrentUser();
  }, []);

  // Get lessons for the course
  useEffect(() => {
    const loadLessons = async () => {
      if (!courseId) return;

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Load from Supabase
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index');

        if (!error && data) {
          setLessons(data);
          if (data.length > 0) {
            setSelectedLessonId(data[0].id);
          }
        }
      } else {
        // Load from localStorage for demo mode
        const demoLessons = JSON.parse(localStorage.getItem('demo-lessons') || '[]');
        const courseLessons = demoLessons
          .filter((lesson: any) => lesson.course_id === courseId)
          .sort((a: any, b: any) => a.order_index - b.order_index);
        
        setLessons(courseLessons);
        if (courseLessons.length > 0) {
          setSelectedLessonId(courseLessons[0].id);
        }
      }
    };

    loadLessons();
  }, [courseId]);

  // Load lesson progress
  useEffect(() => {
    const loadProgress = async () => {
      if (!userId || !courseId) return;

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Load from Supabase
        const { data } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', userId);

        if (data) {
          const progressMap: Record<string, number> = {};
          data.forEach((p: any) => {
            progressMap[p.lesson_id] = p.progress_percentage;
          });
          setLessonProgress(progressMap);
        }
      } else {
        // Load from localStorage for demo mode
        const demoProgress = JSON.parse(localStorage.getItem('demo-lesson-progress') || '[]');
        const userProgress = demoProgress.filter((p: any) => p.user_id === userId);
        
        const progressMap: Record<string, number> = {};
        userProgress.forEach((p: any) => {
          progressMap[p.lesson_id] = p.progress_percentage;
        });
        setLessonProgress(progressMap);
      }
    };

    loadProgress();
  }, [userId, courseId]);

  const course = courses.find(c => c.id === courseId);
  const enrollment = enrollments.find(e => e.course_id === courseId);
  const selectedLesson = lessons.find(l => l.id === selectedLessonId);

  const handleEnroll = async () => {
    if (!userId || !courseId) return;
    
    try {
      await enrollMutation.mutateAsync({ userId, courseId });
    } catch (error) {
      console.error('Enrollment failed:', error);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!userId) return;

    try {
      await updateProgressMutation.mutateAsync({
        userId,
        lessonId,
        progress: 100
      });

      // Update local state
      setLessonProgress(prev => ({
        ...prev,
        [lessonId]: 100
      }));

      // Check if course is complete
      await checkCompletionMutation.mutateAsync({ userId, courseId: courseId! });

      // Move to next lesson if available
      const currentIndex = lessons.findIndex(l => l.id === lessonId);
      if (currentIndex < lessons.length - 1) {
        const nextLesson = lessons[currentIndex + 1];
        setSelectedLessonId(nextLesson.id);
        setCurrentLessonIndex(currentIndex + 1);
      }
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
    }
  };

  const navigateLesson = (direction: 'prev' | 'next') => {
    const currentIndex = lessons.findIndex(l => l.id === selectedLessonId);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < lessons.length) {
      setSelectedLessonId(lessons[newIndex].id);
      setCurrentLessonIndex(newIndex);
    }
  };

  const getVideoUrl = (videoUrl: string) => {
    if (!videoUrl) return '';
    return StorageService.getPublicVideoUrl(videoUrl);
  };

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <Button onClick={() => navigate('/learner/courses')}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{course.title}</CardTitle>
            <CardDescription>{course.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration_hours}h
                </div>
                <Badge variant="secondary">{course.difficulty_level}</Badge>
              </div>
              <Button onClick={handleEnroll} className="w-full">
                Enroll in Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedLessons = lessons.filter(l => lessonProgress[l.id] === 100).length;
  const progressPercentage = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/learner/courses')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-muted-foreground mb-4">{course.description}</p>
          </div>
          <Badge 
            variant={enrollment.status === 'completed' ? 'default' : 'secondary'}
            className="ml-4"
          >
            {enrollment.status}
          </Badge>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground mt-1">
            {completedLessons} of {lessons.length} lessons completed
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lesson List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lessons</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setSelectedLessonId(lesson.id);
                      setCurrentLessonIndex(index);
                    }}
                    className={`w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-b-0 ${
                      selectedLessonId === lesson.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {lessonProgress[lesson.id] === 100 ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{lesson.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {lesson.duration_minutes || 5} min
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lesson Content */}
        <div className="lg:col-span-3">
          {selectedLesson ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedLesson.title}</CardTitle>
                    <CardDescription>
                      Lesson {currentLessonIndex + 1} of {lessons.length}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateLesson('prev')}
                      disabled={currentLessonIndex === 0}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateLesson('next')}
                      disabled={currentLessonIndex === lessons.length - 1}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="content" className="w-full">
                  <TabsList>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    {selectedLesson.video_url && (
                      <TabsTrigger value="video">Video</TabsTrigger>
                    )}
                  </TabsList>
                  
                  <TabsContent value="content" className="mt-4">
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: selectedLesson.content || 'No content available for this lesson.' }} />
                    </div>
                    
                    <div className="mt-6 pt-4 border-t">
                      {lessonProgress[selectedLesson.id] === 100 ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Lesson Completed</span>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => markLessonComplete(selectedLesson.id)}
                          className="w-full"
                        >
                          Mark as Complete
                        </Button>
                      )}
                    </div>
                  </TabsContent>

                  {selectedLesson.video_url && (
                    <TabsContent value="video" className="mt-4">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <video
                          src={getVideoUrl(selectedLesson.video_url)}
                          controls
                          className="w-full h-full"
                          onError={(e) => {
                            console.error('Video load error:', e);
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        {lessonProgress[selectedLesson.id] === 100 ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Lesson Completed</span>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => markLessonComplete(selectedLesson.id)}
                            className="w-full"
                          >
                            Mark as Complete
                          </Button>
                        )}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a lesson to start learning</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
