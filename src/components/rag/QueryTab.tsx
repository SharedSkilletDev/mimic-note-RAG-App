
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
  const { 
    checkBackendConnection, 
    isBackendConnected, 
    isVectorStoreReady,
    vectorizedCount 
  } = useVectorStore();

  // Enhanced connection check on mount
  useEffect(() => {
    const initializeConnection = async () => {
      console.log('QueryTab: Initializing connection on mount...');
      
      try {
        await checkBackendConnection();
        console.log('QueryTab: Connection check completed');
      } catch (error) {
        console.error('QueryTab: Connection check failed:', error);
        toast({
          title: "Connection check failed",
          description: "Could not verify backend connection. Please check the Vector Store tab.",
          variant: "destructive",
        });
      }
    };
    
    initializeConnection();
  }, [checkBackendConnection, toast]);

  // Get unique subject IDs from uploaded data
  const availableSubjectIds = React.useMemo(() => {
    const uniqueIds = [...new Set(uploadedData.map(record => record.subject_id))];
    return uniqueIds.sort((a, b) => a - b);
  }, [uploadedData]);

  const handleSendMessage = async () => {
    console.log('QueryTab: Send message requested');
    console.log('QueryTab: Current state - backend:', isBackendConnected, 'vectorStore:', isVectorStoreReady);
    
    // Pre-flight validation with user feedback
    if (!isBackendConnected) {
      toast({
        title: "Backend not connected", 
        description: "Please connect to the backend service in the Vector Store tab first",
        variant: "destructive",
      });
      return;
    }

    if (!isVectorStoreReady) {
      toast({
        title: "Vector store not ready",
        description: `Please vectorize your data first. Current status: ${vectorizedCount} vectors available`,
        variant: "destructive",
      });
      return;
    }

    if (!query.trim()) {
      toast({
        title: "Empty query",
        description: "Please enter a question or query",
        variant: "destructive",
      });
      return;
    }

    console.log('QueryTab: Pre-flight validation passed, sending message...');
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
      {/* Status indicators for debugging */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span className={`flex items-center gap-1 ${isBackendConnected ? 'text-green-600' : 'text-red-600'}`}>
          Backend: {isBackendConnected ? 'Connected' : 'Disconnected'}
        </span>
        <span className={`flex items-center gap-1 ${isVectorStoreReady ? 'text-green-600' : 'text-yellow-600'}`}>
          Vector Store: {isVectorStoreReady ? `Ready (${vectorizedCount} vectors)` : 'Not Ready'}
        </span>
      </div>

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
