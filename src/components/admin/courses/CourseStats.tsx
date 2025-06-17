
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface CourseStatsProps {
  courses: any[];
  categories: any[];
}

const CourseStats: React.FC<CourseStatsProps> = ({ courses, categories }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{courses.length}</div>
          <div className="text-sm text-muted-foreground">Total Courses</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-success">
            {courses.filter((c: any) => c.status === 'published').length}
          </div>
          <div className="text-sm text-muted-foreground">Published</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-warning">
            {courses.filter((c: any) => c.status === 'draft').length}
          </div>
          <div className="text-sm text-muted-foreground">Drafts</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-info">{categories.length}</div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseStats;
