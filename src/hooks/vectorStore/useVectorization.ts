
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { backendVectorService } from '@/services/backend';

export const useVectorization = () => {
  const [isVectorizing, setIsVectorizing] = useState(false);
  const [vectorizationProgress, setVectorizationProgress] = useState(0);
  const { toast } = useToast();

  const vectorizeData = useCallback(async (
    data: any[], 
    isBackendConnected: boolean,
    onSuccess: (count: number) => void,
    onFailure: () => void
  ) => {
    console.log('=== useVectorization: Starting backend vectorization ===');
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
        onSuccess(result.vectorized_count);
        
        toast({
          title: "Vectorization complete",
          description: `Successfully vectorized ${result.vectorized_count} out of ${data.length} records`,
        });
        console.log(`✅ Backend vectorization successful: ${result.vectorized_count} records ready for search`);
      } else {
        onFailure();
        toast({
          title: "Vectorization failed",
          description: result.message || "No records could be processed. Check backend logs for details.",
          variant: "destructive",
        });
        console.error('❌ Backend vectorization failed:', result.message);
      }
    } catch (error) {
      console.error('❌ Backend vectorization error:', error);
      onFailure();
      toast({
        title: "Vectorization failed",
        description: error instanceof Error ? error.message : "Backend service error occurred",
        variant: "destructive",
      });
    } finally {
      setIsVectorizing(false);
      console.log('=== useVectorization: Backend vectorization process complete ===');
    }
  }, [toast]);

  return {
    isVectorizing,
    vectorizationProgress,
    vectorizeData,
  };
};
