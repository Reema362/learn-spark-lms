
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description?: string;
  duration_hours?: number;
  difficulty_level?: string;
}

interface EnrollmentPromptProps {
  course: Course;
  onEnroll: () => void;
  isEnrolling?: boolean;
}

const EnrollmentPrompt: React.FC<EnrollmentPromptProps> = ({
  course,
  onEnroll,
  isEnrolling = false
}) => {
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
            <Button 
              onClick={onEnroll} 
              className="w-full"
              disabled={isEnrolling}
            >
              {isEnrolling ? 'Enrolling...' : 'Enroll in Course'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollmentPrompt;
