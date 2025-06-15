
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
      toast({
        title: "Initialization failed",
        description: "Could not initialize embedding model",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const vectorizeData = useCallback(async (data: any[]) => {
    console.log('useVectorStore: Starting vectorization with data:', data?.length || 0, 'records');
    
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

    try {
      console.log(`Starting vectorization of ${data.length} records`);
      console.log('Sample record structure:', data[0]);
      
      const vectorizedRecords = await vectorSearchService.vectorizeData(
        data,
        (progress) => {
          console.log(`Vectorization progress: ${progress}%`);
          setVectorizationProgress(progress);
        }
      );

      console.log(`Vectorization completed: ${vectorizedRecords.length} records processed`);
      
      setVectorizedCount(vectorizedRecords.length);
      setIsVectorStoreReady(vectorizedRecords.length > 0);
      
      if (vectorizedRecords.length > 0) {
        toast({
          title: "Vectorization complete",
          description: `Successfully vectorized ${vectorizedRecords.length} records`,
        });
      } else {
        toast({
          title: "Vectorization completed but no records processed",
          description: "Check console for details about data structure issues",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Vectorization failed:', error);
      toast({
        title: "Vectorization failed",
        description: "Could not process the data for vector search",
        variant: "destructive",
      });
    } finally {
      setIsVectorizing(false);
    }
  }, [toast]);

  const searchSimilar = useCallback(async (query: string, topK = 5) => {
    try {
      return await vectorSearchService.searchSimilar(query, topK);
    } catch (error) {
      console.error('Vector search failed:', error);
      toast({
        title: "Search failed",
        description: "Could not perform vector search",
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
