
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatabaseService } from '@/services/database';

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: DatabaseService.getCourses,
  });
};

export const useCourseCategories = () => {
  return useQuery({
    queryKey: ['course-categories'],
    queryFn: DatabaseService.getCourseCategories,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: DatabaseService.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      DatabaseService.updateCourse(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: DatabaseService.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useCreateCourseCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: DatabaseService.createCourseCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-categories'] });
    },
  });
};
