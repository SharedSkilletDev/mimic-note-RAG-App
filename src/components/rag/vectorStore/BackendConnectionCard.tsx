
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Server, Zap, Wifi, WifiOff } from "lucide-react";

interface BackendConnectionCardProps {
  isBackendConnected: boolean;
  backendUrl: string;
  localBackendUrl: string;
  setLocalBackendUrl: (url: string) => void;
  onUrlUpdate: () => void;
  onTestConnection: () => void;
}

export const BackendConnectionCard = ({
  isBackendConnected,
  backendUrl,
  localBackendUrl,
  setLocalBackendUrl,
  onUrlUpdate,
  onTestConnection
}: BackendConnectionCardProps) => {
  return (
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
          <Button onClick={onUrlUpdate} variant="outline">
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
          <Button onClick={onTestConnection} variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            Test Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
