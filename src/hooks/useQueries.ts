
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatabaseService } from '@/services/database';
import { useToast } from '@/hooks/use-toast';

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
    mutationFn: (queryData: any) => DatabaseService.createQuery(queryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] });
      toast({
        title: "Success",
        description: "Query submitted successfully",
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
