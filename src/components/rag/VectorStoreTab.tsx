
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Database, Zap, CheckCircle, AlertCircle, Loader2, Server, Wifi, WifiOff } from "lucide-react";
import { useVectorStore } from "@/hooks/useVectorStore";

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
      {/* Backend Connection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Backend Service Configuration
          </CardTitle>
          <CardDescription>
            Connect to your local backend service running Nomic embedding and FAISS vector store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Backend URL</label>
              <Input
                placeholder="http://localhost:8000"
                value={localBackendUrl}
                onChange={(e) => setLocalBackendUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleUrlUpdate} variant="outline">
              Update
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {isBackendConnected ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              <div>
                <h4 className="font-medium">
                  {isBackendConnected ? 'Connected' : 'Disconnected'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {isBackendConnected 
                    ? 'Backend service is ready' 
                    : 'Cannot reach backend service'}
                </p>
              </div>
            </div>
            <Button onClick={checkBackendConnection} variant="outline">
              <Zap className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vector Store Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Vector Store Management
          </CardTitle>
          <CardDescription>
            Convert your clinical data into searchable vector embeddings using Nomic embedding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isBackendConnected && (
            <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">
                Backend service not connected. Please configure and test the connection above.
              </p>
            </div>
          )}

          {uploadedData.length > 0 && isBackendConnected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Data Ready for Vectorization</h4>
                  <p className="text-sm text-muted-foreground">
                    {uploadedData.length} clinical records loaded
                  </p>
                </div>
                <Button 
                  onClick={handleVectorizeData}
                  disabled={isVectorizing || uploadedData.length === 0 || !isBackendConnected}
                >
                  {isVectorizing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Vectorize Data
                    </>
                  )}
                </Button>
              </div>

              {isVectorizing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Vectorization Progress</span>
                    <span>{Math.round(vectorizationProgress)}%</span>
                  </div>
                  <Progress value={vectorizationProgress} className="w-full" />
                </div>
              )}

              {isVectorStoreReady && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-green-800">Vector Store Ready</p>
                      <p className="text-sm text-green-700">
                        {vectorizedCount} records vectorized and ready for search
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleClearStore}>
                      Clear Store
                    </Button>
                  </div>

                  {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium">Total Vectors</p>
                        <p className="text-2xl font-bold">{stats.total_vectors}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium">Vector Dimension</p>
                        <p className="text-2xl font-bold">{stats.vector_dimension}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium">Unique Subjects</p>
                        <p className="text-2xl font-bold">{stats.unique_subjects}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium">Store Size</p>
                        <p className="text-2xl font-bold">{stats.store_size_mb}MB</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {uploadedData.length === 0 && (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800">
                No data uploaded. Please upload MIMIC IV data first.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Backend Vector Search Architecture</CardTitle>
          <CardDescription>
            Understanding the backend implementation with Nomic embedding and FAISS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">1. Nomic Embedding</h4>
              <p className="text-sm text-muted-foreground">
                Your backend uses Nomic's high-performance embedding model to convert clinical text into dense vector representations with superior semantic understanding.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">2. FAISS Vector Store</h4>
              <p className="text-sm text-muted-foreground">
                Facebook AI Similarity Search (FAISS) provides fast and efficient similarity search capabilities, optimized for large-scale vector operations.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">3. Scalable Architecture</h4>
              <p className="text-sm text-muted-foreground">
                This backend approach can handle much larger datasets and provides faster search performance compared to browser-based solutions.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Backend Requirements</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Python backend with FastAPI or Flask</li>
                <li>• Nomic embedding model installed</li>
                <li>• FAISS library for vector storage</li>
                <li>• Endpoints: /health, /vectorize, /search, /stats, /clear</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
