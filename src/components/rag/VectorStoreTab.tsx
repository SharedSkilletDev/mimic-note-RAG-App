
import React, { useEffect, useState } from 'react';
import { useVectorStore } from "@/hooks/useVectorStore";
import { BackendConnectionCard } from './vectorStore/BackendConnectionCard';
import { VectorStoreManagementCard } from './vectorStore/VectorStoreManagementCard';
import { VectorStoreInfoCard } from './vectorStore/VectorStoreInfoCard';

interface MimicRecord {
  note_id: string;
  subject_id: number;
  hadm_id: number;
  charttime: string;
  cleaned_text: string;
}

interface VectorStoreTabProps {
  uploadedData?: MimicRecord[];
}

export const VectorStoreTab = ({ uploadedData = [] }: VectorStoreTabProps) => {
  const {
    isVectorizing,
    vectorizationProgress,
    isVectorStoreReady,
    vectorizedCount,
    isBackendConnected,
    backendUrl,
    checkBackendConnection,
    updateBackendUrl,
    vectorizeData,
    clearVectorStore,
    getVectorStoreStats
  } = useVectorStore();

  const [localBackendUrl, setLocalBackendUrl] = useState(backendUrl);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Check connection on mount
    checkBackendConnection();
  }, [checkBackendConnection]);

  useEffect(() => {
    // Load stats when vector store is ready
    if (isVectorStoreReady) {
      loadStats();
    }
  }, [isVectorStoreReady]);

  const loadStats = async () => {
    const vectorStats = await getVectorStoreStats();
    setStats(vectorStats);
  };

  const handleUrlUpdate = () => {
    updateBackendUrl(localBackendUrl);
  };

  const handleVectorizeData = async () => {
    if (uploadedData.length === 0) return;
    await vectorizeData(uploadedData);
    if (isVectorStoreReady) {
      loadStats();
    }
  };

  const handleClearStore = async () => {
    await clearVectorStore();
    setStats(null);
  };

  return (
    <div className="space-y-6">
      <BackendConnectionCard
        isBackendConnected={isBackendConnected}
        backendUrl={backendUrl}
        localBackendUrl={localBackendUrl}
        setLocalBackendUrl={setLocalBackendUrl}
        onUrlUpdate={handleUrlUpdate}
        onTestConnection={checkBackendConnection}
      />

      <VectorStoreManagementCard
        uploadedData={uploadedData}
        isBackendConnected={isBackendConnected}
        isVectorizing={isVectorizing}
        vectorizationProgress={vectorizationProgress}
        isVectorStoreReady={isVectorStoreReady}
        vectorizedCount={vectorizedCount}
        stats={stats}
        onVectorizeData={handleVectorizeData}
        onClearStore={handleClearStore}
      />

      <VectorStoreInfoCard />
    </div>
  );
};
