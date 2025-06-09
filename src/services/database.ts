
// Re-export all services for backward compatibility
export { CourseService } from './courseService';
export { UserService } from './userService';
export { LessonService } from './lessonService';
export { EnrollmentService } from './enrollmentService';
export { FileService } from './fileService';
export { AnalyticsService } from './analyticsService';

// Legacy DatabaseService class for backward compatibility
export class DatabaseService {
  // Course Management
  static getCourses = CourseService.getCourses;
  static createCourse = CourseService.createCourse;
  static updateCourse = CourseService.updateCourse;
  static deleteCourse = CourseService.deleteCourse;
  static getCourseCategories = CourseService.getCourseCategories;
  static createCourseCategory = CourseService.createCourseCategory;

  // User Management
  static getUsers = UserService.getUsers;
  static createUser = UserService.createUser;
  static updateUser = UserService.updateUser;
  static deleteUser = UserService.deleteUser;
  static createAdminUser = UserService.createAdminUser;

  // Lessons
  static getLessonsForCourse = LessonService.getLessonsForCourse;
  static createLesson = LessonService.createLesson;
  static updateLesson = LessonService.updateLesson;

  // Course Enrollments
  static getCourseEnrollments = EnrollmentService.getCourseEnrollments;
  static enrollUserInCourse = EnrollmentService.enrollUserInCourse;

  // File Upload
  static uploadFile = FileService.uploadFile;
  static deleteFile = FileService.deleteFile;

  // Analytics
  static getAnalytics = AnalyticsService.getAnalytics;
}
