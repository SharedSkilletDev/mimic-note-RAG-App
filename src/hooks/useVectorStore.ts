
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { vectorSearchService } from '@/services/vectorSearch';

interface MimicRecord {
  note_id: string;
  subject_id: number;
  hadm_id: number;
  charttime: string;
  cleaned_text: string;
}

export const useVectorStore = () => {
  const [isVectorizing, setIsVectorizing] = useState(false);
  const [vectorizationProgress, setVectorizationProgress] = useState(0);
  const [isVectorStoreReady, setIsVectorStoreReady] = useState(false);
  const [vectorizedCount, setVectorizedCount] = useState(0);
  const { toast } = useToast();

  const initializeVectorStore = useCallback(async () => {
    try {
      await vectorSearchService.initialize();
      toast({
        title: "Vector store initialized",
        description: "Ready to process embeddings",
      });
    } catch (error) {
      console.error('Initialization error:', error);
      toast({
        title: "Initialization failed",
        description: "Could not initialize embedding model",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const vectorizeData = useCallback(async (data: any[]) => {
    console.log('=== useVectorStore: Starting vectorization ===');
    console.log('Input data length:', data?.length || 0);
    console.log('Sample input:', data?.[0]);
    
    if (!data || data.length === 0) {
      toast({
        title: "No data to vectorize",
        description: "Please upload data first",
        variant: "destructive",
      });
      return;
    }

    setIsVectorizing(true);
    setVectorizationProgress(0);
    setIsVectorStoreReady(false);
    setVectorizedCount(0);

    try {
      console.log(`Starting vectorization of ${data.length} records`);
      
      const vectorizedRecords = await vectorSearchService.vectorizeData(
        data,
        (progress) => {
          console.log(`Progress update: ${progress}%`);
          setVectorizationProgress(progress);
        }
      );

      console.log(`Vectorization result: ${vectorizedRecords.length} records processed`);
      
      // Update state with results
      const finalCount = vectorizedRecords.length;
      setVectorizedCount(finalCount);
      setIsVectorStoreReady(finalCount > 0);
      
      if (finalCount > 0) {
        toast({
          title: "Vectorization complete",
          description: `Successfully vectorized ${finalCount} out of ${data.length} records`,
        });
        console.log(`✅ Vectorization successful: ${finalCount} records ready for search`);
      } else {
        toast({
          title: "Vectorization failed",
          description: "No records could be processed. Check console for details.",
          variant: "destructive",
        });
        console.error('❌ Vectorization failed: No records processed');
      }
    } catch (error) {
      console.error('❌ Vectorization error:', error);
      toast({
        title: "Vectorization failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      setIsVectorStoreReady(false);
      setVectorizedCount(0);
    } finally {
      setIsVectorizing(false);
      console.log('=== useVectorStore: Vectorization process complete ===');
    }
  }, [toast]);

  const searchSimilar = useCallback(async (query: string, topK = 5) => {
    try {
      console.log(`Searching for: "${query}"`);
      const results = await vectorSearchService.searchSimilar(query, topK);
      console.log(`Search returned ${results.length} results`);
      return results;
    } catch (error) {
      console.error('Vector search failed:', error);
      toast({
        title: "Search failed",
        description: "Could not perform vector search. Ensure data is vectorized first.",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  const clearVectorStore = useCallback(() => {
    vectorSearchService.clearData();
    setIsVectorStoreReady(false);
    setVectorizedCount(0);
    setVectorizationProgress(0);
    toast({
      title: "Vector store cleared",
    });
  }, [toast]);

  return {
    isVectorizing,
    vectorizationProgress,
    isVectorStoreReady,
    vectorizedCount,
    initializeVectorStore,
    vectorizeData,
    searchSimilar,
    clearVectorStore
  };
};
