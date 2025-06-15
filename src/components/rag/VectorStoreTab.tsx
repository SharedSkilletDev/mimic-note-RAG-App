
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Database, Zap, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
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
    initializeVectorStore,
    vectorizeData,
    clearVectorStore
  } = useVectorStore();

  const handleInitialize = async () => {
    try {
      await initializeVectorStore();
    } catch (error) {
      console.error('Failed to initialize vector store:', error);
    }
  };

  const handleVectorizeData = async () => {
    if (uploadedData.length === 0) return;
    await vectorizeData(uploadedData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Vector Store Management
          </CardTitle>
          <CardDescription>
            Convert your clinical data into searchable vector embeddings using local browser-based models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Embedding Model Status</h4>
              <p className="text-sm text-muted-foreground">
                Using Xenova/all-MiniLM-L6-v2 (runs in browser)
              </p>
            </div>
            <Button onClick={handleInitialize} variant="outline">
              <Zap className="h-4 w-4 mr-2" />
              Initialize Model
            </Button>
          </div>

          {uploadedData.length > 0 && (
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
                  disabled={isVectorizing || uploadedData.length === 0}
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
                <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-green-800">Vector Store Ready</p>
                    <p className="text-sm text-green-700">
                      {vectorizedCount} records vectorized and ready for search
                    </p>
                  </div>
                  <Button variant="outline" onClick={clearVectorStore}>
                    Clear Store
                  </Button>
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

      <Card>
        <CardHeader>
          <CardTitle>How Vector Search Works</CardTitle>
          <CardDescription>
            Understanding the local vector search implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">1. Text Embedding</h4>
              <p className="text-sm text-muted-foreground">
                Each clinical note is converted into a high-dimensional vector using the all-MiniLM-L6-v2 model, which runs entirely in your browser.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">2. Similarity Search</h4>
              <p className="text-sm text-muted-foreground">
                When you ask a question, it's also converted to a vector and compared against all stored vectors using cosine similarity.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">3. Context Retrieval</h4>
              <p className="text-sm text-muted-foreground">
                The most similar clinical notes are retrieved and used as context for generating relevant responses about your data.
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Privacy Benefits</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• All processing happens locally in your browser</li>
                <li>• No data sent to external servers</li>
                <li>• Embeddings stored in browser memory only</li>
                <li>• HIPAA compliant by design</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
