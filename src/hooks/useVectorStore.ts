import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { backendVectorService } from '@/services/backend';

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
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000');
  const { toast } = useToast();

  const checkBackendConnection = useCallback(async () => {
    try {
      console.log('useVectorStore: Checking backend connection...');
      const connected = await backendVectorService.checkConnection();
      setIsBackendConnected(connected);
      
      if (connected) {
        console.log('useVectorStore: Backend connected, checking for existing data...');
        
        // Check if there's existing vectorized data
        try {
          const stats = await backendVectorService.getStats();
          console.log('useVectorStore: Stats received:', stats);
          
          if (stats.total_vectors > 0) {
            console.log(`useVectorStore: Found ${stats.total_vectors} existing vectors, setting store as ready`);
            setIsVectorStoreReady(true);
            setVectorizedCount(stats.total_vectors);
            
            toast({
              title: "Vector store ready",
              description: `Found ${stats.total_vectors} vectorized records ready for search`,
            });
          } else {
            console.log('useVectorStore: No vectors found in backend store');
            setIsVectorStoreReady(false);
            setVectorizedCount(0);
          }
        } catch (statsError) {
          console.log('useVectorStore: Could not get stats, assuming no existing data:', statsError);
          setIsVectorStoreReady(false);
          setVectorizedCount(0);
        }
        
        toast({
          title: "Backend connected",
          description: "Successfully connected to the vector service",
        });
      } else {
        console.log('useVectorStore: Backend connection failed');
        setIsVectorStoreReady(false);
        setVectorizedCount(0);
        toast({
          title: "Backend connection failed",
          description: "Could not connect to the vector service. Make sure it's running.",
          variant: "destructive",
        });
      }
      
      return connected;
    } catch (error) {
      console.error('useVectorStore: Connection check error:', error);
      setIsBackendConnected(false);
      setIsVectorStoreReady(false);
      setVectorizedCount(0);
      toast({
        title: "Connection error",
        description: "Failed to check backend connection",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const updateBackendUrl = useCallback((url: string) => {
    setBackendUrl(url);
    backendVectorService.setBaseUrl(url);
    setIsBackendConnected(false);
    setIsVectorStoreReady(false);
    setVectorizedCount(0);
  }, []);

  const vectorizeData = useCallback(async (data: any[]) => {
    console.log('=== useVectorStore: Starting backend vectorization ===');
    console.log('Input data length:', data?.length || 0);
    
    if (!data || data.length === 0) {
      toast({
        title: "No data to vectorize",
        description: "Please upload data first",
        variant: "destructive",
      });
      return;
    }

    if (!isBackendConnected) {
      toast({
        title: "Backend not connected",
        description: "Please connect to the backend service first",
        variant: "destructive",
      });
      return;
    }

    setIsVectorizing(true);
    setVectorizationProgress(0);
    setIsVectorStoreReady(false);
    setVectorizedCount(0);

    try {
      console.log(`Starting backend vectorization of ${data.length} records`);
      
      const result = await backendVectorService.vectorizeData(
        data,
        (progress) => {
          console.log(`Progress update: ${progress}%`);
          setVectorizationProgress(progress);
        }
      );

      console.log(`Vectorization result:`, result);
      
      if (result.success && result.vectorized_count > 0) {
        setVectorizedCount(result.vectorized_count);
        setIsVectorStoreReady(true);
        
        toast({
          title: "Vectorization complete",
          description: `Successfully vectorized ${result.vectorized_count} out of ${data.length} records`,
        });
        console.log(`✅ Backend vectorization successful: ${result.vectorized_count} records ready for search`);
      } else {
        toast({
          title: "Vectorization failed",
          description: result.message || "No records could be processed. Check backend logs for details.",
          variant: "destructive",
        });
        console.error('❌ Backend vectorization failed:', result.message);
      }
    } catch (error) {
      console.error('❌ Backend vectorization error:', error);
      toast({
        title: "Vectorization failed",
        description: error instanceof Error ? error.message : "Backend service error occurred",
        variant: "destructive",
      });
      setIsVectorStoreReady(false);
      setVectorizedCount(0);
    } finally {
      setIsVectorizing(false);
      console.log('=== useVectorStore: Backend vectorization process complete ===');
    }
  }, [toast, isBackendConnected]);

  const searchSimilar = useCallback(async (query: string, topK = 5, subjectId?: string) => {
    try {
      console.log(`useVectorStore: Searching backend for: "${query}"`);
      console.log(`useVectorStore: isVectorStoreReady = ${isVectorStoreReady}`);
      
      const result = await backendVectorService.searchSimilar(query, topK, subjectId);
      
      if (result.success) {
        console.log(`useVectorStore: Backend search returned ${result.results.length} results`);
        return result.results;
      } else {
        throw new Error('Search failed on backend');
      }
    } catch (error) {
      console.error('useVectorStore: Backend vector search failed:', error);
      toast({
        title: "Search failed",
        description: "Could not perform vector search. Check backend connection.",
        variant: "destructive",
      });
      return [];
    }
  }, [toast, isVectorStoreReady]);

  const clearVectorStore = useCallback(async () => {
    try {
      await backendVectorService.clearVectorStore();
      setIsVectorStoreReady(false);
      setVectorizedCount(0);
      setVectorizationProgress(0);
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
    isVectorizing,
    vectorizationProgress,
    isVectorStoreReady,
    vectorizedCount,
    isBackendConnected,
    backendUrl,
    checkBackendConnection,
    updateBackendUrl,
    vectorizeData,
    searchSimilar,
    clearVectorStore,
    getVectorStoreStats
  };
};
