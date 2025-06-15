
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Clock, User, RefreshCw } from "lucide-react";

interface ConfigurationPanelProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  subjectId: string;
  setSubjectId: (id: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  availableSubjectIds: number[];
  availableModels: string[];
  onRefreshModels: () => void;
}

export const ConfigurationPanel = ({
  selectedModel,
  setSelectedModel,
  subjectId,
  setSubjectId,
  dateRange,
  setDateRange,
  availableSubjectIds,
  availableModels,
  onRefreshModels
}: ConfigurationPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          RAG Configuration
        </CardTitle>
        <CardDescription>
          Configure your RAG system settings and select data parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ollama Model</label>
            <div className="flex gap-2">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={onRefreshModels}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Models available on your local Ollama instance
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <User className="h-4 w-4" />
              Subject ID
            </label>
            {availableSubjectIds.length > 0 ? (
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select subject ID" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {availableSubjectIds.map((id) => (
                    <SelectItem key={id} value={id.toString()}>
                      Subject {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-2 text-sm text-muted-foreground border rounded">
                No data uploaded
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Date Range (optional)
            </label>
            <Input
              placeholder="e.g., 2183-04-01 to 2183-04-30"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
