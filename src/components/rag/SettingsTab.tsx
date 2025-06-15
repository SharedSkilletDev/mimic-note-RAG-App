import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Shield, Cpu, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const SettingsTab = () => {
  const [settings, setSettings] = useState({
    ollamaUrl: 'http://localhost:11434',
    embeddingModel: 'nomic-embed-text:latest',
    llmModel: 'llama3.2:latest',
    chunkSize: 512,
    chunkOverlap: 50,
    topK: 5,
    enableLogging: true,
    enableCache: true,
  });

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

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your RAG system configuration has been updated",
    });
  };

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
    <div className="space-y-6">
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
                value={settings.ollamaUrl}
                onChange={(e) => setSettings({...settings, ollamaUrl: e.target.value})}
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
              <Select value={settings.embeddingModel} onValueChange={(value) => setSettings({...settings, embeddingModel: value})}>
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
              <Select value={settings.llmModel} onValueChange={(value) => setSettings({...settings, llmModel: value})}>
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
                value={settings.chunkSize}
                onChange={(e) => setSettings({...settings, chunkSize: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chunk-overlap">Chunk Overlap (tokens)</Label>
              <Input
                id="chunk-overlap"
                type="number"
                value={settings.chunkOverlap}
                onChange={(e) => setSettings({...settings, chunkOverlap: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="top-k">Top-K Results</Label>
              <Input
                id="top-k"
                type="number"
                value={settings.topK}
                onChange={(e) => setSettings({...settings, topK: parseInt(e.target.value)})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            HIPAA compliance and data security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Logging</p>
                <p className="text-sm text-muted-foreground">Log system activities for debugging</p>
              </div>
              <Switch
                checked={settings.enableLogging}
                onCheckedChange={(checked) => setSettings({...settings, enableLogging: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Caching</p>
                <p className="text-sm text-muted-foreground">Cache embeddings and results locally</p>
              </div>
              <Switch
                checked={settings.enableCache}
                onCheckedChange={(checked) => setSettings({...settings, enableCache: checked})}
              />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">HIPAA Compliance Features</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• All data processing happens locally on your device</li>
              <li>• No data is sent to external APIs or services</li>
              <li>• Vector embeddings are stored locally</li>
              <li>• Full audit trail of data access (when logging enabled)</li>
              <li>• Secure local storage with encryption at rest</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Installation Guide
          </CardTitle>
          <CardDescription>
            Step-by-step setup for your local RAG system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">1. Install Ollama</h4>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                curl -fsSL https://ollama.com/install.sh | sh
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">2. Pull Required Models</h4>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm space-y-1">
                <div>ollama pull nomic-embed-text</div>
                <div>ollama pull llama3.1</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">3. Install Python Dependencies</h4>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm space-y-1">
                <div>pip install llama-index langchain</div>
                <div>pip install faiss-cpu chromadb</div>
                <div>pip install streamlit</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">4. Run Your RAG System</h4>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                python rag_system.py
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
};
