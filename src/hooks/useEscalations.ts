
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatabaseService } from '@/services/database';
import { useToast } from '@/hooks/use-toast';

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
    mutationFn: (escalationData: any) => DatabaseService.createEscalation(escalationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalations'] });
      toast({
        title: "Success",
        description: "Escalation created successfully",
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
