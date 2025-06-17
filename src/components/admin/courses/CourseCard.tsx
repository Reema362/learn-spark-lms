
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Video, Eye, Play, Edit, Trash2 } from 'lucide-react';

interface CourseCardProps {
  course: any;
  onEdit: (course: any) => void;
  onDelete: (courseId: string) => void;
  onPreview: (course: any) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit, onDelete, onPreview }) => {
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
    <Card className="dashboard-card hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 line-clamp-2">{course.title}</CardTitle>
            {getStatusBadge(course.status)}
          </div>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(course)}
              title="Edit course"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(course.id)}
              title="Delete course"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4 line-clamp-2">
          {course.description || 'No description available'}
        </CardDescription>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            {formatDuration(course.duration_hours || 1)}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            {course.difficulty_level || 'Beginner'}
          </div>
          {course.course_categories && (
            <div className="flex items-center">
              <span 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: course.course_categories.color }}
              ></span>
              {course.course_categories.name}
            </div>
          )}
          {course.video_url && (
            <div className="flex items-center text-green-600">
              <Video className="h-4 w-4 mr-2" />
              Video Available
            </div>
          )}
        </div>
        <div className="flex space-x-2 mt-4">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onPreview(course)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          {course.video_url && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onPreview(course)}
            >
              <Play className="h-4 w-4 mr-2" />
              Play Video
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
