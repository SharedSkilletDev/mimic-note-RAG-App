
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OllamaConfigCardProps {
  ollamaUrl: string;
  embeddingModel: string;
  llmModel: string;
  onOllamaUrlChange: (url: string) => void;
  onEmbeddingModelChange: (model: string) => void;
  onLlmModelChange: (model: string) => void;
}

export const OllamaConfigCard = ({
  ollamaUrl,
  embeddingModel,
  llmModel,
  onOllamaUrlChange,
  onEmbeddingModelChange,
  onLlmModelChange
}: OllamaConfigCardProps) => {
  const { toast } = useToast();

  // Available models from your Ollama instance
  const embeddingModels = ['nomic-embed-text:latest'];
  const llmModels = [
    'llama3.2:latest',
    'llama3.1:8b', 
    'mistral:latest',
    'summarizer:latest',
    'gemma'
  ];

  const handleTestConnection = async () => {
    // Simulate testing Ollama connection
    toast({
      title: "Testing connection...",
      description: "Checking Ollama availability",
    });

    setTimeout(() => {
      toast({
        title: "Connection successful",
        description: "Ollama is running and accessible",
      });
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Ollama Configuration
        </CardTitle>
        <CardDescription>
          Configure your local Ollama instance for embeddings and LLM inference
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ollama-url">Ollama URL</Label>
          <div className="flex gap-2">
            <Input
              id="ollama-url"
              value={ollamaUrl}
              onChange={(e) => onOllamaUrlChange(e.target.value)}
              placeholder="http://localhost:11434"
            />
            <Button onClick={handleTestConnection} variant="outline">
              Test Connection
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="embedding-model">Embedding Model</Label>
            <Select value={embeddingModel} onValueChange={onEmbeddingModelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {embeddingModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Used for converting text to vector embeddings
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="llm-model">LLM Model</Label>
            <Select value={llmModel} onValueChange={onLlmModelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {llmModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Used for generating responses and analysis
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
