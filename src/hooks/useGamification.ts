
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatabaseService } from '@/services/database';
import { useToast } from '@/hooks/use-toast';

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
    mutationFn: (gameData: any) => DatabaseService.createGame(gameData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      toast({
        title: "Success",
        description: "Game created successfully",
      });
    },
    onError: (error: any) => {
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
    onError: (error: any) => {
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
