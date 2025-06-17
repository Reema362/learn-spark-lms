
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Volume2, Maximize, Clock, BookOpen, Award } from 'lucide-react';
import { StorageService } from '@/services/storageService';
import { useEnrollUserInCourse, useUpdateLessonProgress, useCheckCourseCompletion } from '@/hooks/useEnrollments';
import { useToast } from '@/hooks/use-toast';

interface CourseViewerProps {
  course: any;
  isOpen: boolean;
  onClose: () => void;
}

const CourseViewer: React.FC<CourseViewerProps> = ({ course, isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchProgress, setWatchProgress] = useState(0);
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  
  const enrollUser = useEnrollUserInCourse();
  const updateProgress = useUpdateLessonProgress();
  const checkCompletion = useCheckCourseCompletion();
  const { toast } = useToast();

  // Get current user - handle both auth and demo mode
  const getCurrentUser = () => {
    try {
      // Try to get authenticated user first
      const authUser = JSON.parse(localStorage.getItem('supabase.auth.token') || 'null');
      if (authUser?.user) {
        return authUser.user;
      }
    } catch (error) {
      console.log('No auth user found');
    }
    
    try {
      // Fall back to demo user
      const demoUser = JSON.parse(localStorage.getItem('avocop_user') || 'null');
      return demoUser;
    } catch (error) {
      console.log('No demo user found');
      return null;
    }
  };

  useEffect(() => {
    if (course?.video_url && isOpen) {
      try {
        const url = StorageService.getPublicUrl(course.video_url);
        console.log('Setting video URL for course:', course.title);
        console.log('Processed video URL:', url);
        setVideoUrl(url);
        setVideoError(null);
        
        // Auto-enroll user when they open the course
        const user = getCurrentUser();
        if (user?.id) {
          console.log('Auto-enrolling user:', user.id, 'in course:', course.id);
          enrollUser.mutate({ 
            courseId: course.id, 
            userId: user.id 
          }, {
            onError: (error) => {
              console.error('Auto-enrollment failed:', error);
            }
          });
        } else {
          console.log('No user found for auto-enrollment');
        }
      } catch (error: any) {
        console.error('Error getting video URL:', error);
        setVideoError('Failed to load video URL');
        setVideoUrl(null);
      }
    }
  }, [course?.video_url, isOpen, enrollUser]);

  // Track video progress
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      progressIntervalRef.current = setInterval(() => {
        const video = videoRef.current;
        if (video && video.duration > 0) {
          const progress = Math.round((video.currentTime / video.duration) * 100);
          setWatchProgress(progress);
          setCurrentTime(video.currentTime);
          
          // Update progress every 10% or every 30 seconds, whichever comes first
          const timeSinceLastUpdate = Date.now() - lastProgressUpdate;
          const progressDelta = Math.abs(progress - (watchProgress || 0));
          
          if (progressDelta >= 10 || timeSinceLastUpdate >= 30000) {
            const user = getCurrentUser();
            if (user?.id && course?.id) {
              // Use course ID as lesson ID for video-based courses
              const videoLessonId = course.id;
              
              console.log('Updating progress for user:', user.id, 'lesson:', videoLessonId, 'progress:', progress);
              updateProgress.mutate({
                lessonId: videoLessonId,
                userId: user.id,
                progressPercentage: progress,
                timeSpentMinutes: Math.round(video.currentTime / 60)
              }, {
                onError: (error) => {
                  console.error('Progress update failed:', error);
                }
              });
              
              setLastProgressUpdate(Date.now());
              
              // Check for course completion if video is finished
              if (progress >= 95) { // Consider 95% as complete to account for buffering
                console.log('Course near completion, checking completion status');
                checkCompletion.mutate({
                  courseId: course.id,
                  userId: user.id
                }, {
                  onSuccess: () => {
                    toast({
                      title: "Course Completed!",
                      description: `Congratulations! You've completed "${course.title}".`,
                    });
                  },
                  onError: (error) => {
                    console.error('Completion check failed:', error);
                  }
                });
              }
            }
          }
        }
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, watchProgress, lastProgressUpdate, updateProgress, checkCompletion, course, toast]);

  const handleVideoError = (e: any) => {
    console.error('Video playback error:', e);
    setVideoError('Video failed to load. Please try refreshing or contact support.');
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
    setVideoError(null);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((error) => {
          console.error('Video play failed:', error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

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

  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-xl font-bold">{course.title}</DialogTitle>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline">{course.difficulty_level || 'Beginner'}</Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {formatDuration(course.duration_hours || 1)}
              </div>
              {course.course_categories && (
                <Badge variant="secondary">
                  {course.course_categories.name}
                </Badge>
              )}
              {watchProgress > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {watchProgress}% Complete
                </Badge>
              )}
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-6">
            {/* Video Player Section */}
            {course.video_url && (
              <div className="mb-6">
                <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
                  {videoError ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                      <div className="text-center">
                        <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">{videoError}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            setVideoError(null);
                            if (course?.video_url) {
                              const url = StorageService.getPublicUrl(course.video_url);
                              setVideoUrl(url);
                            }
                          }}
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  ) : videoUrl ? (
                    <>
                      <video
                        ref={videoRef}
                        className="w-full h-full"
                        onError={handleVideoError}
                        onLoadedData={handleVideoLoad}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                        preload="metadata"
                        controls
                      >
                        <source src={videoUrl} type="video/mp4" />
                        <source src={videoUrl} type="video/webm" />
                        <source src={videoUrl} type="video/quicktime" />
                        Your browser does not support the video tag.
                      </video>
                      
                      {/* Progress Overlay */}
                      {watchProgress > 0 && (
                        <div className="absolute bottom-2 left-2 right-2 bg-black/50 rounded p-2">
                          <div className="flex items-center justify-between text-white text-xs mb-1">
                            <span>Progress: {watchProgress}%</span>
                            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                          </div>
                          <Progress value={watchProgress} className="h-1" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                        <p className="text-sm">Loading video...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Course Information */}
            <div className="space-y-4 mb-6">
              {course.description && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Course Description
                  </h3>
                  <p className="text-muted-foreground">{course.description}</p>
                </div>
              )}

              {course.content && (
                <div>
                  <h3 className="font-semibold mb-2">Course Content</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">{course.content}</p>
                  </div>
                </div>
              )}

              {/* Course Progress */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Learning Progress
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Video Progress</span>
                    <span>{watchProgress}%</span>
                  </div>
                  <Progress value={watchProgress} className="h-2" />
                  {watchProgress >= 95 ? (
                    <p className="text-xs text-green-600 mt-2 font-medium">
                      🎉 Course completed! Great job!
                    </p>
                  ) : watchProgress > 0 ? (
                    <p className="text-xs text-blue-600 mt-2">
                      Keep watching to complete the course
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-2">
                      Start watching to track your progress
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <div className="p-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {course.video_url && !videoError && (
                <Button onClick={handlePlayPause}>
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Video
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      {watchProgress > 0 ? 'Continue Learning' : 'Start Learning'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseViewer;
