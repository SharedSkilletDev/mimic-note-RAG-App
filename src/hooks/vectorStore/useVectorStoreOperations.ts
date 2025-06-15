
import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { backendVectorService } from '@/services/backend';

export const useVectorStoreOperations = () => {
  const { toast } = useToast();

  const clearVectorStore = useCallback(async (onClear: () => void) => {
    try {
      await backendVectorService.clearVectorStore();
      onClear();
      toast({
        title: "Vector store cleared",
        description: "Backend vector store has been cleared",
      });
    } catch (error) {
      console.error('Failed to clear vector store:', error);
      toast({
        title: "Clear failed",
        description: "Could not clear vector store. Check backend connection.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const getVectorStoreStats = useCallback(async () => {
    try {
      return await backendVectorService.getStats();
    } catch (error) {
      console.error('Failed to get vector store stats:', error);
      return null;
    }
  }, []);

  return {
    clearVectorStore,
    getVectorStoreStats,
  };
};
