
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { backendVectorService } from '@/services/backend';

export const useVectorStoreState = () => {
  const [isVectorStoreReady, setIsVectorStoreReady] = useState(false);
  const [vectorizedCount, setVectorizedCount] = useState(0);
  const { toast } = useToast();

  const checkExistingData = useCallback(async () => {
    try {
      console.log('✅ useVectorStoreState: Checking for existing data...');
      const stats = await backendVectorService.getStats();
      console.log('📊 useVectorStoreState: Stats received:', stats);
      
      if (stats.total_vectors > 0) {
        console.log(`✅ useVectorStoreState: Found ${stats.total_vectors} existing vectors, setting store as ready`);
        setIsVectorStoreReady(true);
        setVectorizedCount(stats.total_vectors);
        
        toast({
          title: "Vector store ready",
          description: `Found ${stats.total_vectors} vectorized records ready for search`,
        });
      } else {
        console.log('ℹ️ useVectorStoreState: No vectors found in backend store');
        setIsVectorStoreReady(false);
        setVectorizedCount(0);
      }
    } catch (statsError) {
      console.log('⚠️ useVectorStoreState: Could not get stats, assuming no existing data:', statsError);
      setIsVectorStoreReady(false);
      setVectorizedCount(0);
    }
  }, [toast]);

  const resetVectorStoreState = useCallback(() => {
    setIsVectorStoreReady(false);
    setVectorizedCount(0);
  }, []);

  const updateVectorStoreState = useCallback((ready: boolean, count: number) => {
    setIsVectorStoreReady(ready);
    setVectorizedCount(count);
  }, []);

  return {
    isVectorStoreReady,
    vectorizedCount,
    checkExistingData,
    resetVectorStoreState,
    updateVectorStoreState,
  };
};
