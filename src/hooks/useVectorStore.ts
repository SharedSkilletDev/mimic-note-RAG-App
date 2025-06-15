
import { useCallback, useEffect } from 'react';
import { useBackendConnection } from './vectorStore/useBackendConnection';
import { useVectorStoreState } from './vectorStore/useVectorStoreState';
import { useVectorization } from './vectorStore/useVectorization';
import { useVectorSearch } from './vectorStore/useVectorSearch';
import { useVectorStoreOperations } from './vectorStore/useVectorStoreOperations';

export const useVectorStore = () => {
  const {
    isBackendConnected,
    backendUrl,
    checkBackendConnection,
    updateBackendUrl,
  } = useBackendConnection();

  const {
    isVectorStoreReady,
    vectorizedCount,
    checkExistingData,
    resetVectorStoreState,
    updateVectorStoreState,
  } = useVectorStoreState();

  const {
    isVectorizing,
    vectorizationProgress,
    vectorizeData: performVectorization,
  } = useVectorization();

  const { searchSimilar } = useVectorSearch();

  const { clearVectorStore: performClearVectorStore, getVectorStoreStats } = useVectorStoreOperations();

  // Enhanced checkBackendConnection that also checks for existing data
  const enhancedCheckBackendConnection = useCallback(async () => {
    const connected = await checkBackendConnection();
    
    if (connected) {
      await checkExistingData();
    } else {
      resetVectorStoreState();
    }
    
    console.log('🔌 useVectorStore: Final state - connected:', connected, 'vectorStoreReady:', connected ? isVectorStoreReady : false);
    return connected;
  }, [checkBackendConnection, checkExistingData, resetVectorStoreState, isVectorStoreReady]);

  // Enhanced updateBackendUrl that resets state
  const enhancedUpdateBackendUrl = useCallback((url: string) => {
    updateBackendUrl(url);
    resetVectorStoreState();
  }, [updateBackendUrl, resetVectorStoreState]);

  // Vectorize data with state management
  const vectorizeData = useCallback(async (data: any[]) => {
    await performVectorization(
      data,
      isBackendConnected,
      (count) => updateVectorStoreState(true, count),
      () => updateVectorStoreState(false, 0)
    );
  }, [performVectorization, isBackendConnected, updateVectorStoreState]);

  // Clear vector store with state reset
  const clearVectorStore = useCallback(async () => {
    await performClearVectorStore(() => {
      updateVectorStoreState(false, 0);
    });
  }, [performClearVectorStore, updateVectorStoreState]);

  // Enhanced searchSimilar with ready state check
  const enhancedSearchSimilar = useCallback(async (query: string, topK = 5, subjectId?: string) => {
    return await searchSimilar(query, topK, subjectId, isVectorStoreReady);
  }, [searchSimilar, isVectorStoreReady]);

  return {
    isVectorizing,
    vectorizationProgress,
    isVectorStoreReady,
    vectorizedCount,
    isBackendConnected,
    backendUrl,
    checkBackendConnection: enhancedCheckBackendConnection,
    updateBackendUrl: enhancedUpdateBackendUrl,
    vectorizeData,
    searchSimilar: enhancedSearchSimilar,
    clearVectorStore,
    getVectorStoreStats
  };
};
