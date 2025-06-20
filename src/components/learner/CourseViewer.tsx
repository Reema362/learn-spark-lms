
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '@/hooks/useCourses';
import { useCourseEnrollments, useEnrollUserInCourse, useUpdateLessonProgress, useCheckCourseCompletion } from '@/hooks/useEnrollments';
import { useCourseData } from '@/hooks/useCourseData';
import CourseHeader from './course-viewer/CourseHeader';
import LessonList from './course-viewer/LessonList';
import LessonContent from './course-viewer/LessonContent';
import EnrollmentPrompt from './course-viewer/EnrollmentPrompt';

const CourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const { data: courses = [] } = useCourses();
  const { userId, lessons, lessonProgress, updateLessonProgress } = useCourseData(courseId);
  const { data: enrollments = [] } = useCourseEnrollments(userId);
  const enrollMutation = useEnrollUserInCourse();
  const updateProgressMutation = useUpdateLessonProgress();
  const checkCompletionMutation = useCheckCourseCompletion();

  // Set initial lesson when lessons load
  React.useEffect(() => {
    if (lessons.length > 0 && !selectedLessonId) {
      setSelectedLessonId(lessons[0].id);
      setCurrentLessonIndex(0);
    }
  }, [lessons, selectedLessonId]);

  const course = courses.find(c => c.id === courseId);
  const enrollment = enrollments.find(e => e.course_id === courseId);
  const selectedLesson = lessons.find(l => l.id === selectedLessonId);

  const handleEnroll = async () => {
    if (!userId || !courseId) return;
    
    try {
      await enrollMutation.mutateAsync({ userId, courseId });
    } catch (error) {
      console.error('Enrollment failed:', error);
    }
  };

  const handleLessonSelect = (lessonId: string, index: number) => {
    setSelectedLessonId(lessonId);
    setCurrentLessonIndex(index);
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!userId) return;

    try {
      await updateProgressMutation.mutateAsync({
        userId,
        lessonId,
        progress: 100
      });

      // Update local state
      updateLessonProgress(lessonId, 100);

      // Check if course is complete
      await checkCompletionMutation.mutateAsync({ userId, courseId: courseId! });

      // Move to next lesson if available
      const currentIndex = lessons.findIndex(l => l.id === lessonId);
      if (currentIndex < lessons.length - 1) {
        const nextLesson = lessons[currentIndex + 1];
        setSelectedLessonId(nextLesson.id);
        setCurrentLessonIndex(currentIndex + 1);
      }
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
    }
  };

  const navigateLesson = (direction: 'prev' | 'next') => {
    const currentIndex = lessons.findIndex(l => l.id === selectedLessonId);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < lessons.length) {
      setSelectedLessonId(lessons[newIndex].id);
      setCurrentLessonIndex(newIndex);
    }
  };

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <button onClick={() => navigate('/learner/courses')}>
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <EnrollmentPrompt
        course={course}
        onEnroll={handleEnroll}
        isEnrolling={enrollMutation.isPending}
      />
    );
  }

  const completedLessons = lessons.filter(l => lessonProgress[l.id] === 100).length;
  const progressPercentage = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <CourseHeader
        course={course}
        enrollment={enrollment}
        progressPercentage={progressPercentage}
        completedLessons={completedLessons}
        totalLessons={lessons.length}
        onBack={() => navigate('/learner/courses')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lesson List */}
        <div className="lg:col-span-1">
          <LessonList
            lessons={lessons}
            selectedLessonId={selectedLessonId}
            lessonProgress={lessonProgress}
            onLessonSelect={handleLessonSelect}
          />
        </div>

        {/* Lesson Content */}
        <div className="lg:col-span-3">
          <LessonContent
            lesson={selectedLesson}
            currentLessonIndex={currentLessonIndex}
            totalLessons={lessons.length}
            lessonProgress={lessonProgress}
            onNavigateLesson={navigateLesson}
            onMarkComplete={markLessonComplete}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
