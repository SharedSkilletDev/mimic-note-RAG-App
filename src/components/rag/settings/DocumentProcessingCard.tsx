
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
          Document Processing
        </CardTitle>
        <CardDescription>
          Configure how your clinical documents are processed and chunked
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="chunk-size">Chunk Size (tokens)</Label>
            <Input
              id="chunk-size"
              type="number"
              value={chunkSize}
              onChange={(e) => onChunkSizeChange(parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chunk-overlap">Chunk Overlap (tokens)</Label>
            <Input
              id="chunk-overlap"
              type="number"
              value={chunkOverlap}
              onChange={(e) => onChunkOverlapChange(parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="top-k">Top-K Results</Label>
            <Input
              id="top-k"
              type="number"
              value={topK}
              onChange={(e) => onTopKChange(parseInt(e.target.value))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
