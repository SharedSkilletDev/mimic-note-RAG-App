
import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { backendVectorService } from '@/services/backend';

export const useVectorSearch = () => {
  const { toast } = useToast();

  const searchSimilar = useCallback(async (
    query: string, 
    topK = 5, 
    subjectId?: string,
    isVectorStoreReady?: boolean
  ) => {
    try {
      console.log(`useVectorSearch: Searching backend for: "${query}"`);
      console.log(`useVectorSearch: isVectorStoreReady = ${isVectorStoreReady}`);
      
      const result = await backendVectorService.searchSimilar(query, topK, subjectId);
      
      if (result.success) {
        console.log(`useVectorSearch: Backend search returned ${result.results.length} results`);
        return result.results;
      } else {
        throw new Error('Search failed on backend');
      }
    } catch (error) {
      console.error('useVectorSearch: Backend vector search failed:', error);
      toast({
        title: "Search failed",
        description: "Could not perform vector search. Check backend connection.",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  return {
    searchSimilar,
  };
};
