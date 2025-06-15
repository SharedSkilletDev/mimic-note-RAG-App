
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Database, Play, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const VectorStoreTab = () => {
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexStatus, setIndexStatus] = useState<'not_started' | 'in_progress' | 'completed' | 'error'>('not_started');
  const { toast } = useToast();

  const startIndexing = async () => {
    setIsIndexing(true);
    setIndexStatus('in_progress');
    setIndexingProgress(0);

    // Simulate indexing process
    const interval = setInterval(() => {
      setIndexingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsIndexing(false);
          setIndexStatus('completed');
          toast({
            title: "Indexing completed",
            description: "Your clinical notes are now ready for semantic search",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const getStatusIcon = () => {
    switch (indexStatus) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'in_progress':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Database className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (indexStatus) {
      case 'completed':
        return 'Vector index is ready';
      case 'error':
        return 'Indexing failed';
      case 'in_progress':
        return 'Creating vector embeddings...';
      default:
        return 'Vector index not created';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Vector Store Status
          </CardTitle>
          <CardDescription>
            Monitor and manage your local vector embeddings for semantic search
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            {getStatusIcon()}
            <div className="flex-1">
              <p className="font-medium">{getStatusText()}</p>
              {indexStatus === 'in_progress' && (
                <div className="mt-2">
                  <Progress value={indexingProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {indexingProgress}% complete
                  </p>
                </div>
              )}
            </div>
          </div>

          {indexStatus === 'not_started' && (
            <Button onClick={startIndexing} disabled={isIndexing} className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Start Vector Indexing
            </Button>
          )}

          {indexStatus === 'completed' && (
            <Button onClick={startIndexing} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-index Documents
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Embedding Configuration</CardTitle>
          <CardDescription>
            Current settings for your local embedding model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium">Model</p>
              <p className="text-sm text-muted-foreground">nomic-embed-text</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium">Provider</p>
              <p className="text-sm text-muted-foreground">Ollama (Local)</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium">Dimensions</p>
              <p className="text-sm text-muted-foreground">768</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium">Chunk Size</p>
              <p className="text-sm text-muted-foreground">512 tokens</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vector Store Statistics</CardTitle>
          <CardDescription>
            Overview of your indexed clinical documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">1,247</p>
              <p className="text-sm text-muted-foreground">Total Documents</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">8,529</p>
              <p className="text-sm text-muted-foreground">Text Chunks</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-primary">156</p>
              <p className="text-sm text-muted-foreground">Unique Patients</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Local Processing Pipeline</CardTitle>
          <CardDescription>
            How your clinical data is processed locally
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">1</div>
              <div>
                <p className="font-medium">Text Preprocessing</p>
                <p className="text-sm text-muted-foreground">Clean and normalize clinical notes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">2</div>
              <div>
                <p className="font-medium">Chunking</p>
                <p className="text-sm text-muted-foreground">Split documents into semantic chunks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">3</div>
              <div>
                <p className="font-medium">Embedding Generation</p>
                <p className="text-sm text-muted-foreground">Create vector embeddings using Nomic model</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">4</div>
              <div>
                <p className="font-medium">Vector Storage</p>
                <p className="text-sm text-muted-foreground">Store embeddings in local FAISS index</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
