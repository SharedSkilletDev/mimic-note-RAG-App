
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
    checkBackendConnection: baseCheckConnection,
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

  const { searchSimilar: baseSearchSimilar } = useVectorSearch();

  const { clearVectorStore: performClearVectorStore, getVectorStoreStats } = useVectorStoreOperations();

  // Enhanced connection check with proper state management
  const checkBackendConnection = useCallback(async () => {
    console.log('🔌 useVectorStore: Starting enhanced connection check...');
    
    try {
      // First check backend connectivity
      const connected = await baseCheckConnection();
      console.log('🔌 useVectorStore: Base connection result:', connected);
      
      if (connected) {
        // If connected, check for existing vectorized data
        console.log('✅ useVectorStore: Backend connected, checking existing data...');
        await checkExistingData();
        console.log('📊 useVectorStore: Data check complete - vectorStore ready:', isVectorStoreReady);
      } else {
        // If not connected, reset vector store state
        console.log('❌ useVectorStore: Backend not connected, resetting state...');
        resetVectorStoreState();
      }
      
      return connected;
    } catch (error) {
      console.error('❌ useVectorStore: Connection check failed:', error);
      resetVectorStoreState();
      return false;
    }
  }, [baseCheckConnection, checkExistingData, resetVectorStoreState, isVectorStoreReady]);

  // Enhanced URL update with state reset
  const enhancedUpdateBackendUrl = useCallback((url: string) => {
    console.log('🔧 useVectorStore: Updating backend URL to:', url);
    updateBackendUrl(url);
    resetVectorStoreState();
  }, [updateBackendUrl, resetVectorStoreState]);

  // Enhanced vectorization with proper state management
  const vectorizeData = useCallback(async (data: any[]) => {
    console.log('📊 useVectorStore: Starting vectorization for', data.length, 'records');
    
    if (!isBackendConnected) {
      throw new Error('Backend not connected - cannot vectorize data');
    }

    try {
      await performVectorization(
        data,
        isBackendConnected,
        (count) => {
          console.log('✅ useVectorStore: Vectorization success, updating state with count:', count);
          updateVectorStoreState(true, count);
        },
        () => {
          console.log('❌ useVectorStore: Vectorization failed, resetting state');
          updateVectorStoreState(false, 0);
        }
      );
    } catch (error) {
      console.error('❌ useVectorStore: Vectorization error:', error);
      updateVectorStoreState(false, 0);
      throw error;
    }
  }, [performVectorization, isBackendConnected, updateVectorStoreState]);

  // Enhanced search with validation
  const searchSimilar = useCallback(async (query: string, topK = 5, subjectId?: string) => {
    console.log('🔍 useVectorStore: Starting search validation...');
    console.log('🔍 useVectorStore: Current state - backend:', isBackendConnected, 'vectorStore:', isVectorStoreReady);
    
    if (!isBackendConnected) {
      console.error('❌ useVectorStore: Search blocked - backend not connected');
      throw new Error('Backend service not connected');
    }

    if (!isVectorStoreReady) {
      console.error('❌ useVectorStore: Search blocked - vector store not ready');
      throw new Error('Vector store not ready - please vectorize data first');
    }

    console.log('✅ useVectorStore: Validation passed, performing search...');
    
    try {
      const results = await baseSearchSimilar(query, topK, subjectId, isVectorStoreReady);
      console.log('✅ useVectorStore: Search completed successfully with', results.length, 'results');
      return results;
    } catch (error) {
      console.error('❌ useVectorStore: Search failed:', error);
      throw error;
    }
  }, [baseSearchSimilar, isBackendConnected, isVectorStoreReady]);

  // Enhanced clear with state reset
  const clearVectorStore = useCallback(async () => {
    console.log('🧹 useVectorStore: Clearing vector store...');
    
    try {
      await performClearVectorStore(() => {
        console.log('✅ useVectorStore: Clear completed, resetting state');
        updateVectorStoreState(false, 0);
      });
    } catch (error) {
      console.error('❌ useVectorStore: Clear failed:', error);
      throw error;
    }
  }, [performClearVectorStore, updateVectorStoreState]);

  // Log state changes for debugging
  useEffect(() => {
    console.log('📊 useVectorStore: State update - backend:', isBackendConnected, 'vectorStore:', isVectorStoreReady, 'count:', vectorizedCount);
  }, [isBackendConnected, isVectorStoreReady, vectorizedCount]);

  return {
    isVectorizing,
    vectorizationProgress,
    isVectorStoreReady,
    vectorizedCount,
    isBackendConnected,
    backendUrl,
    checkBackendConnection,
    updateBackendUrl: enhancedUpdateBackendUrl,
    vectorizeData,
    searchSimilar,
    clearVectorStore,
    getVectorStoreStats
  };
};
