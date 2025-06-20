
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ollamaLLMService } from '@/services/ollamaLLM';

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
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'failed' | 'testing'>('idle');

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
    setIsTestingConnection(true);
    setConnectionStatus('testing');
    
    console.log('🔧 OllamaConfigCard: Testing connection to:', ollamaUrl);
    
    toast({
      title: "Testing connection...",
      description: "Checking Ollama availability at " + ollamaUrl,
    });

    try {
      const isConnected = await ollamaLLMService.checkConnection();
      
      if (isConnected) {
        setConnectionStatus('connected');
        toast({
          title: "Connection successful",
          description: "Ollama is running and accessible",
        });
      } else {
        setConnectionStatus('failed');
        toast({
          title: "Connection failed",
          description: "Could not connect to Ollama. Make sure it's running with 'ollama serve'",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('🔧 OllamaConfigCard: Connection test error:', error);
      setConnectionStatus('failed');
      toast({
        title: "Connection error",
        description: "Network error or CORS issue. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'testing':
        return <AlertCircle className="h-4 w-4 text-yellow-600 animate-pulse" />;
      default:
        return null;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'failed':
        return 'Connection Failed';
      case 'testing':
        return 'Testing...';
      default:
        return '';
    }
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
            <Button 
              onClick={handleTestConnection} 
              variant="outline" 
              disabled={isTestingConnection}
              className="flex items-center gap-2"
            >
              {getConnectionIcon()}
              {isTestingConnection ? 'Testing...' : 'Test'}
            </Button>
          </div>
          {connectionStatus !== 'idle' && (
            <div className={`text-sm flex items-center gap-2 ${
              connectionStatus === 'connected' ? 'text-green-600' : 
              connectionStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {getConnectionIcon()}
              {getConnectionStatusText()}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Make sure Ollama is running with: <code>ollama serve</code>
          </p>
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

        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Troubleshooting Connection Issues:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Ensure Ollama is running: <code>ollama serve</code></li>
            <li>• Check if models are installed: <code>ollama list</code></li>
            <li>• For CORS issues, consider running Ollama with proper headers</li>
            <li>• Verify the URL is correct (usually http://localhost:11434)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
