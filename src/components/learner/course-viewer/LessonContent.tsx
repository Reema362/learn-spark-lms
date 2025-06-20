
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { StorageService } from '@/services/storageService';

interface Lesson {
  id: string;
  title: string;
  content?: string;
  video_url?: string;
}

interface LessonContentProps {
  lesson: Lesson | undefined;
  currentLessonIndex: number;
  totalLessons: number;
  lessonProgress: Record<string, number>;
  onNavigateLesson: (direction: 'prev' | 'next') => void;
  onMarkComplete: (lessonId: string) => void;
}

const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  currentLessonIndex,
  totalLessons,
  lessonProgress,
  onNavigateLesson,
  onMarkComplete
}) => {
  const getVideoUrl = (videoUrl: string) => {
    if (!videoUrl) return '';
    return StorageService.getPublicVideoUrl(videoUrl);
  };

  if (!lesson) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a lesson to start learning</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isCompleted = lessonProgress[lesson.id] === 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{lesson.title}</CardTitle>
            <CardDescription>
              Lesson {currentLessonIndex + 1} of {totalLessons}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateLesson('prev')}
              disabled={currentLessonIndex === 0}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateLesson('next')}
              disabled={currentLessonIndex === totalLessons - 1}
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
            {lesson.video_url && (
              <TabsTrigger value="video">Video</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="content" className="mt-4">
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: lesson.content || 'No content available for this lesson.' }} />
            </div>
            
            <div className="mt-6 pt-4 border-t">
              {isCompleted ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Lesson Completed</span>
                </div>
              ) : (
                <Button 
                  onClick={() => onMarkComplete(lesson.id)}
                  className="w-full"
                >
                  Mark as Complete
                </Button>
              )}
            </div>
          </TabsContent>

          {lesson.video_url && (
            <TabsContent value="video" className="mt-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={getVideoUrl(lesson.video_url)}
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
                {isCompleted ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Lesson Completed</span>
                  </div>
                ) : (
                  <Button 
                    onClick={() => onMarkComplete(lesson.id)}
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
  );
};

export default LessonContent;
