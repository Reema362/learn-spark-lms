
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Users, Video, FileText } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import { StorageService } from '@/services/storageService';

interface CoursePreviewProps {
  course: any;
  isOpen: boolean;
  onClose: () => void;
}

const CoursePreview: React.FC<CoursePreviewProps> = ({ course, isOpen, onClose }) => {
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-success text-success-foreground">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Get public video URL for preview
  const getVideoUrl = () => {
    if (course.video_url) {
      return StorageService.getPublicVideoUrl(course.video_url);
    }
    return '';
  };

  const videoUrl = getVideoUrl();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{course.title}</DialogTitle>
            <DialogDescription>Course preview and details</DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6">
              {/* Course Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(course.status)}
                    {course.is_mandatory && (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                        Mandatory
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(course.duration_hours || 1)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.difficulty_level || 'Beginner'}
                    </div>
                  </div>
                </div>
                
                {videoUrl && (
                  <Button onClick={() => setVideoPlayerOpen(true)} className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Play Video
                  </Button>
                )}
              </div>

              {/* Thumbnail */}
              {course.thumbnail_url && (
                <div className="w-full h-48 bg-muted rounded-lg overflow-hidden">
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

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-semibold">Description</h3>
                <p className="text-muted-foreground">
                  {course.description || 'No description available'}
                </p>
              </div>

              {/* Content */}
              {course.content && (
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Course Content
                  </h3>
                  <ScrollArea className="bg-muted/50 p-4 rounded-lg max-h-40">
                    <p className="text-sm whitespace-pre-wrap">{course.content}</p>
                  </ScrollArea>
                </div>
              )}

              {/* Media Information */}
              <div className="space-y-2">
                <h3 className="font-semibold">Media Files</h3>
                <div className="space-y-2">
                  {videoUrl && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Video Content</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setVideoPlayerOpen(true)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    </div>
                  )}
                  
                  {course.thumbnail_url && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Thumbnail Image</span>
                      </div>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  )}
                  
                  {!videoUrl && !course.thumbnail_url && (
                    <p className="text-sm text-muted-foreground">No media files uploaded</p>
                  )}
                </div>
              </div>

              {/* Category */}
              {course.course_categories && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Category</h3>
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: course.course_categories.color }}
                    ></span>
                    <span className="text-sm">{course.course_categories.name}</span>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="space-y-2">
                <h3 className="font-semibold">Course Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <span className="ml-2">
                      {course.created_at ? new Date(course.created_at).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="ml-2">
                      {course.updated_at ? new Date(course.updated_at).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Debug Information */}
              {videoUrl && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-xs text-muted-foreground">Debug Info</h3>
                  <div className="bg-muted/30 p-2 rounded text-xs font-mono break-all">
                    <p><strong>Original Video URL:</strong> {course.video_url}</p>
                    <p><strong>Public Video URL:</strong> {videoUrl}</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Video Player Modal */}
      {videoUrl && (
        <VideoPlayer
          videoUrl={course.video_url}
          title={course.title}
          isOpen={videoPlayerOpen}
          onClose={() => setVideoPlayerOpen(false)}
        />
      )}
    </>
  );
};

export default CoursePreview;
