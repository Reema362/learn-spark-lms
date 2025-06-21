
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CourseService } from '@/services/courseService';

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: CourseService.getCourses,
  });
};

export const useCourseCategories = () => {
  return useQuery({
    queryKey: ['course-categories'],
    queryFn: CourseService.getCourseCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => {
      if (!data) return [];
      // Remove duplicates based on id
      return data.filter((category: any, index: number, self: any[]) => 
        index === self.findIndex((c: any) => c.id === category.id)
      );
    }
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: CourseService.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      CourseService.updateCourse(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: CourseService.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useCreateCourseCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: CourseService.createCourseCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-categories'] });
    },
  });
};
