
export const getTemplateCategory = (name: string) => {
  if (name.toLowerCase().includes('course assignment') || name.toLowerCase().includes('send course')) {
    return 'course-assignment';
  }
  if (name.toLowerCase().includes('course completion')) {
    return 'course-completion';
  }
  if (name.toLowerCase().includes('course reminder')) {
    return 'course-reminder';
  }
  if (name.toLowerCase().includes('quiz failure')) {
    return 'course-quiz-failure';
  }
  if (name.toLowerCase().includes('manager reminder')) {
    return 'manager-reminder';
  }
  if (name.toLowerCase().includes('certification')) {
    return 'course-certification';
  }
  return 'custom';
};

export const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'course-assignment', label: 'Course Assignment' },
  { value: 'course-completion', label: 'Course Completion' },
  { value: 'course-reminder', label: 'Course Reminder' },
  { value: 'course-quiz-failure', label: 'Course Quiz Failure' },
  { value: 'manager-reminder', label: 'Manager Reminder' },
  { value: 'course-certification', label: 'Course Certification' },
  { value: 'custom', label: 'Custom' }
];
