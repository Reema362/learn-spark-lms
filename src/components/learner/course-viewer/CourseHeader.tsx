
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description?: string;
}

interface Enrollment {
  status: string;
}

interface CourseHeaderProps {
  course: Course;
  enrollment: Enrollment;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  onBack: () => void;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({
  course,
  enrollment,
  progressPercentage,
  completedLessons,
  totalLessons,
  onBack
}) => {
  return (
    <div className="mb-6">
      <Button 
        variant="ghost" 
        onClick={onBack}
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
          {completedLessons} of {totalLessons} lessons completed
        </p>
      </div>
    </div>
  );
};

export default CourseHeader;
