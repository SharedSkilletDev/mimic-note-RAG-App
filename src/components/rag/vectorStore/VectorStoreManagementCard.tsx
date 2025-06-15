
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Database, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { VectorStoreStats } from './VectorStoreStats';

interface MimicRecord {
  note_id: string;
  subject_id: number;
  hadm_id: number;
  charttime: string;
  cleaned_text: string;
}

interface VectorStoreManagementCardProps {
  uploadedData: MimicRecord[];
  isBackendConnected: boolean;
  isVectorizing: boolean;
  vectorizationProgress: number;
  isVectorStoreReady: boolean;
  vectorizedCount: number;
  stats: any;
  onVectorizeData: () => void;
  onClearStore: () => void;
}

export const VectorStoreManagementCard = ({
  uploadedData,
  isBackendConnected,
  isVectorizing,
  vectorizationProgress,
  isVectorStoreReady,
  vectorizedCount,
  stats,
  onVectorizeData,
  onClearStore
}: VectorStoreManagementCardProps) => {
  return (
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
                onClick={onVectorizeData}
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
                  <Button variant="outline" onClick={onClearStore}>
                    Clear Store
                  </Button>
                </div>

                {stats && <VectorStoreStats stats={stats} />}
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
  );
};
