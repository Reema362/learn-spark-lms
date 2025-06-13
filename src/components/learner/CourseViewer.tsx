
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Volume2, Maximize, Clock, BookOpen, Award } from 'lucide-react';
import { StorageService } from '@/services/storageService';

interface CourseViewerProps {
  course: any;
  isOpen: boolean;
  onClose: () => void;
}

const CourseViewer: React.FC<CourseViewerProps> = ({ course, isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    if (course?.video_url && isOpen) {
      try {
        // Get the proper URL for video playback
        const url = StorageService.getPublicUrl(course.video_url);
        console.log('Setting video URL for course:', course.title);
        console.log('Original video_url:', course.video_url);
        console.log('Processed video URL:', url);
        setVideoUrl(url);
        setVideoError(null);
      } catch (error: any) {
        console.error('Error getting video URL:', error);
        setVideoError('Failed to load video URL');
        setVideoUrl(null);
      }
    }
  }, [course?.video_url, isOpen]);

  const handleVideoError = (e: any) => {
    console.error('Video playback error:', e);
    setVideoError('Video failed to load. Please try refreshing or contact support.');
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
    setVideoError(null);
  };

  if (!course) return null;

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
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-6">
            {/* Video Player Section */}
            {course.video_url && (
              <div className="mb-6">
                <div className="bg-black rounded-lg overflow-hidden aspect-video">
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
                    <video
                      className="w-full h-full"
                      controls
                      onError={handleVideoError}
                      onLoadedData={handleVideoLoad}
                      preload="metadata"
                    >
                      <source src={videoUrl} type="video/mp4" />
                      <source src={videoUrl} type="video/webm" />
                      <source src={videoUrl} type="video/quicktime" />
                      Your browser does not support the video tag.
                    </video>
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

              {/* Course Progress Placeholder */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Learning Progress
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Start watching to track your progress
                  </p>
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
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Continue Learning
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
