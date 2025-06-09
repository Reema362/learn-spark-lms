
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatabaseService } from '@/services/database';
import { useToast } from '@/hooks/use-toast';

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: DatabaseService.getCourses,
    staleTime: 30000, // Cache for 30 seconds
    retry: 3,
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: DatabaseService.getUsers,
    staleTime: 30000, // Cache for 30 seconds
    retry: 3,
  });
};

export const useCourseCategories = () => {
  return useQuery({
    queryKey: ['course-categories'],
    queryFn: DatabaseService.getCourseCategories,
    staleTime: 300000, // Cache for 5 minutes
    retry: 3,
  });
};

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: DatabaseService.getAnalytics,
    staleTime: 60000, // Cache for 1 minute
    retry: 3,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: DatabaseService.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({
        title: "Success",
        description: "Course created successfully",
      });
    },
    onError: (error) => {
      console.error('Create course error:', error);
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
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
    },
    onError: (error) => {
      console.error('Update course error:', error);
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
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Delete course error:', error);
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
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error) => {
      console.error('Create user error:', error);
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
      console.error('File upload error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
