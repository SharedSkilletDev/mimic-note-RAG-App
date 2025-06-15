
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { OllamaConfigCard } from "./settings/OllamaConfigCard";
import { DocumentProcessingCard } from "./settings/DocumentProcessingCard";
import { PrivacySecurityCard } from "./settings/PrivacySecurityCard";
import { InstallationGuideCard } from "./settings/InstallationGuideCard";

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

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your RAG system configuration has been updated",
    });
  };

  return (
    <div className="space-y-6">
      <OllamaConfigCard
        ollamaUrl={settings.ollamaUrl}
        embeddingModel={settings.embeddingModel}
        llmModel={settings.llmModel}
        onOllamaUrlChange={(url) => setSettings({...settings, ollamaUrl: url})}
        onEmbeddingModelChange={(model) => setSettings({...settings, embeddingModel: model})}
        onLlmModelChange={(model) => setSettings({...settings, llmModel: model})}
      />

      <DocumentProcessingCard
        chunkSize={settings.chunkSize}
        chunkOverlap={settings.chunkOverlap}
        topK={settings.topK}
        onChunkSizeChange={(size) => setSettings({...settings, chunkSize: size})}
        onChunkOverlapChange={(overlap) => setSettings({...settings, chunkOverlap: overlap})}
        onTopKChange={(topK) => setSettings({...settings, topK: topK})}
      />

      <PrivacySecurityCard
        enableLogging={settings.enableLogging}
        enableCache={settings.enableCache}
        onEnableLoggingChange={(enabled) => setSettings({...settings, enableLogging: enabled})}
        onEnableCacheChange={(enabled) => setSettings({...settings, enableCache: enabled})}
      />

      <InstallationGuideCard />

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
};
