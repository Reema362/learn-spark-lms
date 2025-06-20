
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  duration_minutes?: number;
}

interface LessonListProps {
  lessons: Lesson[];
  selectedLessonId: string;
  lessonProgress: Record<string, number>;
  onLessonSelect: (lessonId: string, index: number) => void;
}

const LessonList: React.FC<LessonListProps> = ({
  lessons,
  selectedLessonId,
  lessonProgress,
  onLessonSelect
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Lessons</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              onClick={() => onLessonSelect(lesson.id, index)}
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
  );
};

export default LessonList;
