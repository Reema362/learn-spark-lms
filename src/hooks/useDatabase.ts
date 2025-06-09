
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatabaseService } from '@/services/database';
import { useToast } from '@/hooks/use-toast';

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: DatabaseService.getCourses,
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: DatabaseService.getUsers,
  });
};

export const useCourseCategories = () => {
  return useQuery({
    queryKey: ['course-categories'],
    queryFn: DatabaseService.getCourseCategories,
  });
};

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: DatabaseService.getAnalytics,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: DatabaseService.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Success",
        description: "Course created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      DatabaseService.updateCourse(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: DatabaseService.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: DatabaseService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUploadFile = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ file, path }: { file: File; path: string }) =>
      DatabaseService.uploadFile(file, path),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
