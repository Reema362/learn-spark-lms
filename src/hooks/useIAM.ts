
import { useQuery } from '@tanstack/react-query';
import { DatabaseService } from '@/services/database';

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
