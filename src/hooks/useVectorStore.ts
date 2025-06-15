
import { useCallback, useEffect, useMemo } from 'react';
import { useBackendConnection } from './vectorStore/useBackendConnection';
import { useVectorStoreState } from './vectorStore/useVectorStoreState';
import { useVectorization } from './vectorStore/useVectorization';
import { useVectorSearch } from './vectorStore/useVectorSearch';
import { useVectorStoreOperations } from './vectorStore/useVectorStoreOperations';

export const useVectorStore = () => {
  // Initialize hooks in a stable order
  const backendConnection = useBackendConnection();
  const vectorStoreState = useVectorStoreState();
  const vectorization = useVectorization();
  const vectorSearch = useVectorSearch();
  const vectorStoreOperations = useVectorStoreOperations();

  // Destructure after all hooks are initialized
  const {
    isBackendConnected,
    backendUrl,
    checkBackendConnection: baseCheckConnection,
    updateBackendUrl,
  } = backendConnection;

  const {
    isVectorStoreReady,
    vectorizedCount,
    checkExistingData,
    resetVectorStoreState,
    updateVectorStoreState,
  } = vectorStoreState;

  const {
    isVectorizing,
    vectorizationProgress,
    vectorizeData: performVectorization,
  } = vectorization;

  const { searchSimilar: baseSearchSimilar } = vectorSearch;

  const { clearVectorStore: performClearVectorStore, getVectorStoreStats } = vectorStoreOperations;

  // Memoize stable functions to prevent unnecessary re-renders
  const checkBackendConnection = useCallback(async () => {
    console.log('🔌 useVectorStore: Starting enhanced connection check...');
    
    try {
      const connected = await baseCheckConnection();
      console.log('🔌 useVectorStore: Base connection result:', connected);
      
      if (connected) {
        console.log('✅ useVectorStore: Backend connected, checking existing data...');
        await checkExistingData();
      } else {
        console.log('❌ useVectorStore: Backend not connected, resetting state...');
        resetVectorStoreState();
      }
      
      return connected;
    } catch (error) {
      console.error('❌ useVectorStore: Connection check failed:', error);
      resetVectorStoreState();
      return false;
    }
  }, [baseCheckConnection, checkExistingData, resetVectorStoreState]);

  const enhancedUpdateBackendUrl = useCallback((url: string) => {
    console.log('🔧 useVectorStore: Updating backend URL to:', url);
    updateBackendUrl(url);
    resetVectorStoreState();
  }, [updateBackendUrl, resetVectorStoreState]);

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

  const searchSimilar = useCallback(async (query: string, topK = 5, subjectId?: string) => {
    console.log('🔍 useVectorStore: Starting search validation...');
    
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

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
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
  }), [
    isVectorizing,
    vectorizationProgress,
    isVectorStoreReady,
    vectorizedCount,
    isBackendConnected,
    backendUrl,
    checkBackendConnection,
    enhancedUpdateBackendUrl,
    vectorizeData,
    searchSimilar,
    clearVectorStore,
    getVectorStoreStats
  ]);
};
