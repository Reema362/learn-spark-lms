
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

// Campaign Management Hooks
export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: DatabaseService.getCampaigns,
    staleTime: 30000,
    retry: 3,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: DatabaseService.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: "Success",
        description: "Campaign created successfully",
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

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      DatabaseService.updateCampaign(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: "Success",
        description: "Campaign updated successfully",
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

// Escalation Management Hooks
export const useEscalations = () => {
  return useQuery({
    queryKey: ['escalations'],
    queryFn: DatabaseService.getEscalations,
    staleTime: 30000,
    retry: 3,
  });
};

export const useCreateEscalation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: DatabaseService.createEscalation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalations'] });
      toast({
        title: "Success",
        description: "Escalation created successfully",
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

// Query Management Hooks
export const useQueries = () => {
  return useQuery({
    queryKey: ['queries'],
    queryFn: DatabaseService.getQueries,
    staleTime: 30000,
    retry: 3,
  });
};

export const useCreateQuery = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: DatabaseService.createQuery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] });
      toast({
        title: "Success",
        description: "Query submitted successfully",
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

// Template Management Hooks
export const useTemplates = () => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: DatabaseService.getTemplates,
    staleTime: 30000,
    retry: 3,
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: DatabaseService.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: "Success",
        description: "Template created successfully",
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

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      DatabaseService.updateTemplate(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: "Success",
        description: "Template updated successfully",
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

// IAM Management Hooks
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: DatabaseService.getRoles,
    staleTime: 300000,
    retry: 3,
  });
};

export const useUserRoles = () => {
  return useQuery({
    queryKey: ['user-roles'],
    queryFn: DatabaseService.getUserRoles,
    staleTime: 60000,
    retry: 3,
  });
};

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: DatabaseService.getAuditLogs,
    staleTime: 30000,
    retry: 3,
  });
};

// Gamification Hooks
export const useGames = () => {
  return useQuery({
    queryKey: ['games'],
    queryFn: DatabaseService.getGames,
    staleTime: 300000,
    retry: 3,
  });
};

export const useGameBadges = () => {
  return useQuery({
    queryKey: ['game-badges'],
    queryFn: DatabaseService.getGameBadges,
    staleTime: 300000,
    retry: 3,
  });
};

export const useCreateGame = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: DatabaseService.createGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      toast({
        title: "Success",
        description: "Game created successfully",
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

export const useSubmitGameSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ gameId, score, timeTaken, answers }: { 
      gameId: string; 
      score: number; 
      timeTaken: number; 
      answers: any; 
    }) => DatabaseService.submitGameSession(gameId, score, timeTaken, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-game-stats'] });
      toast({
        title: "Success",
        description: "Game completed successfully!",
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

export const useUserGameStats = (userId?: string) => {
  return useQuery({
    queryKey: ['user-game-stats', userId],
    queryFn: () => DatabaseService.getUserGameStats(userId),
    staleTime: 60000,
    retry: 3,
  });
};

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: DatabaseService.getLeaderboard,
    staleTime: 60000,
    retry: 3,
  });
};
