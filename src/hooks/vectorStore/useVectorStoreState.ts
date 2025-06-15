
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { backendVectorService } from '@/services/backend';

export const useVectorStoreState = () => {
  const [isVectorStoreReady, setIsVectorStoreReady] = useState(false);
  const [vectorizedCount, setVectorizedCount] = useState(0);
  const { toast } = useToast();

  const checkExistingData = useCallback(async () => {
    console.log('📊 useVectorStoreState: Checking for existing vectorized data...');
    
    try {
      const stats = await backendVectorService.getStats();
      console.log('📊 useVectorStoreState: Received stats:', stats);
      
      if (stats && stats.total_vectors > 0) {
        console.log(`✅ useVectorStoreState: Found ${stats.total_vectors} existing vectors`);
        setIsVectorStoreReady(true);
        setVectorizedCount(stats.total_vectors);
        
        toast({
          title: "Vector store ready",
          description: `Found ${stats.total_vectors} vectorized records ready for search`,
        });
        
        return true;
      } else {
        console.log('ℹ️ useVectorStoreState: No existing vectors found');
        setIsVectorStoreReady(false);
        setVectorizedCount(0);
        return false;
      }
    } catch (error) {
      console.error('⚠️ useVectorStoreState: Failed to check existing data:', error);
      setIsVectorStoreReady(false);
      setVectorizedCount(0);
      return false;
    }
  }, [toast]);

  const resetVectorStoreState = useCallback(() => {
    console.log('🔄 useVectorStoreState: Resetting vector store state');
    setIsVectorStoreReady(false);
    setVectorizedCount(0);
  }, []);

  const updateVectorStoreState = useCallback((ready: boolean, count: number) => {
    console.log('🔄 useVectorStoreState: Updating state - ready:', ready, 'count:', count);
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
