
import { useQuery } from '@tanstack/react-query';
import { DatabaseService } from '@/services/database';

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: DatabaseService.getAnalytics,
    staleTime: 60000, // Cache for 1 minute
    retry: 3,
  });
};
