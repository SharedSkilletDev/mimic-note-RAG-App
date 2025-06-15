
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
    console.log('🔍 useVectorSearch: Starting search...');
    console.log('🔍 useVectorSearch: Query:', query);
    console.log('🔍 useVectorSearch: TopK:', topK);
    console.log('🔍 useVectorSearch: SubjectID:', subjectId);
    console.log('🔍 useVectorSearch: VectorStore ready:', isVectorStoreReady);
    
    try {
      const result = await backendVectorService.searchSimilar(query, topK, subjectId);
      console.log('📊 useVectorSearch: Raw backend result:', result);
      
      if (result && result.success && Array.isArray(result.results)) {
        console.log(`✅ useVectorSearch: Search successful - ${result.results.length} results found`);
        return result.results;
      } else {
        console.error('❌ useVectorSearch: Invalid result format:', result);
        throw new Error('Invalid search result format from backend');
      }
    } catch (error) {
      console.error('❌ useVectorSearch: Search failed:', error);
      
      toast({
        title: "Vector search failed",
        description: `Could not perform vector search: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      
      // Return empty array instead of throwing to prevent cascading errors
      return [];
    }
  }, [toast]);

  return {
    searchSimilar,
  };
};
