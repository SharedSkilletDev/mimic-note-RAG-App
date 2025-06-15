
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ConfigurationPanel } from './config/ConfigurationPanel';
import { ChatInterface } from './chat/ChatInterface';
import { SampleQueries } from './samples/SampleQueries';
import { useChat } from '@/hooks/useChat';
import { useVectorStore } from '@/hooks/useVectorStore';

interface MimicRecord {
  note_id: string;
  subject_id: number;
  hadm_id: number;
  charttime: string;
  cleaned_text: string;
}

interface QueryTabProps {
  uploadedData?: MimicRecord[];
}

export const QueryTab = ({ uploadedData = [] }: QueryTabProps) => {
  const [query, setQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('llama3.2:latest');
  const [subjectId, setSubjectId] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [availableModels] = useState([
    'llama3.2:latest',
    'llama3.1:8b',
    'mistral:latest',
    'gemma2',
    'summarizer:latest',
    'nomic-embed-text:latest'
  ]);
  
  const { toast } = useToast();
  const { messages, isStreaming, sendMessage, clearConversation } = useChat();
  const { checkBackendConnection, isBackendConnected, isVectorStoreReady } = useVectorStore();

  // Check backend connection when component mounts
  useEffect(() => {
    const checkConnection = async () => {
      console.log('QueryTab: Checking backend connection on mount...');
      await checkBackendConnection();
    };
    
    checkConnection();
  }, [checkBackendConnection]);

  // Get unique subject IDs from uploaded data
  const availableSubjectIds = React.useMemo(() => {
    const uniqueIds = [...new Set(uploadedData.map(record => record.subject_id))];
    return uniqueIds.sort((a, b) => a - b);
  }, [uploadedData]);

  const handleSendMessage = async () => {
    // Double-check connection before sending message
    if (!isBackendConnected) {
      console.log('QueryTab: Backend not connected, attempting to reconnect...');
      const connected = await checkBackendConnection();
      if (!connected) {
        toast({
          title: "Backend connection failed",
          description: "Please ensure the backend service is running and try again",
          variant: "destructive",
        });
        return;
      }
    }

    await sendMessage(query, subjectId, availableSubjectIds, selectedModel);
    setQuery('');
  };

  const refreshModels = () => {
    toast({
      title: "Models refreshed",
      description: "Available Ollama models updated",
    });
  };

  const handleSelectQuery = (selectedQuery: string) => {
    setQuery(selectedQuery);
  };

  return (
    <div className="space-y-6">
      <ConfigurationPanel
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        subjectId={subjectId}
        setSubjectId={setSubjectId}
        dateRange={dateRange}
        setDateRange={setDateRange}
        availableSubjectIds={availableSubjectIds}
        availableModels={availableModels}
        onRefreshModels={refreshModels}
      />

      <ChatInterface
        messages={messages}
        query={query}
        setQuery={setQuery}
        onSendMessage={handleSendMessage}
        onClearConversation={clearConversation}
        isStreaming={isStreaming}
      />

      <SampleQueries onSelectQuery={handleSelectQuery} />
    </div>
  );
};
