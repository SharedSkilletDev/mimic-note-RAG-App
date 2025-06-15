
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database } from "lucide-react";

interface DocumentProcessingCardProps {
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  onChunkSizeChange: (size: number) => void;
  onChunkOverlapChange: (overlap: number) => void;
  onTopKChange: (topK: number) => void;
}

export const DocumentProcessingCard = ({
  chunkSize,
  chunkOverlap,
  topK,
  onChunkSizeChange,
  onChunkOverlapChange,
  onTopKChange
}: DocumentProcessingCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Document Processing & LLM Configuration
        </CardTitle>
        <CardDescription>
          Configure how your clinical documents are processed and how the LLM generates responses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Vector Search Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chunk-size">Chunk Size (tokens)</Label>
              <Input
                id="chunk-size"
                type="number"
                value={chunkSize}
                onChange={(e) => onChunkSizeChange(parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Size of text chunks for vectorization (512-2048 recommended)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chunk-overlap">Chunk Overlap (tokens)</Label>
              <Input
                id="chunk-overlap"
                type="number"
                value={chunkOverlap}
                onChange={(e) => onChunkOverlapChange(parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Overlap between chunks to maintain context (10-20% of chunk size)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="top-k">Top-K Results</Label>
              <Input
                id="top-k"
                type="number"
                value={topK}
                onChange={(e) => onTopKChange(parseInt(e.target.value))}
                min="1"
                max="20"
              />
              <p className="text-xs text-muted-foreground">
                Number of similar records to retrieve (1-20)
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-sm mb-4">LLM Response Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Output Tokens</Label>
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                Currently set to: <strong>1200 tokens</strong>
              </div>
              <p className="text-xs text-muted-foreground">
                Increased for comprehensive medical analysis
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Response Structure</Label>
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                <strong>Structured Clinical Analysis</strong>
              </div>
              <p className="text-xs text-muted-foreground">
                Organized with sections, insights, and recommendations
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-sm mb-2">Integration Status</h4>
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Vector Store Integration: Active
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Ollama LLM Integration: Enhanced Response Generation
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Streaming Response: Real-time Display
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
