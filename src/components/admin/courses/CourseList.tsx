
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Video } from 'lucide-react';
import CourseCard from './CourseCard';

interface CourseListProps {
  courses: any[];
  onEdit: (course: any) => void;
  onDelete: (courseId: string) => void;
  onPreview: (course: any) => void;
  onCreateNew: () => void;
}

const CourseList: React.FC<CourseListProps> = ({ 
  courses, 
  onEdit, 
  onDelete, 
  onPreview, 
  onCreateNew 
}) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">No courses found matching your criteria.</p>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Course
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course: any) => (
        <CourseCard
          key={course.id}
          course={course}
          onEdit={onEdit}
          onDelete={onDelete}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
};

export default CourseList;
