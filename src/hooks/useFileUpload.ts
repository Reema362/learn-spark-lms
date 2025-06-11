
import { useMutation } from '@tanstack/react-query';
import { DatabaseService } from '@/services/database';
import { useToast } from '@/hooks/use-toast';

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
    onError: (error: any) => {
      console.error('File upload error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
