
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useVectorStore } from './useVectorStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();
  const { searchSimilar, isVectorStoreReady, isBackendConnected, checkBackendConnection } = useVectorStore();

  const generateResponse = async (query: string, similarRecords: any[]) => {
    // Create context from similar records with similarity scores
    const context = similarRecords.map((record, index) => 
      `[Similarity: ${(record.similarity_score * 100).toFixed(1)}%] Subject ${record.subject_id} (${record.charttime}): ${record.cleaned_text.substring(0, 500)}...`
    ).join('\n\n');

    // Generate more informative responses based on context and similarity scores
    const topSimilarity = similarRecords[0]?.similarity_score || 0;
    const responses = [
      `Based on the clinical records, I found ${similarRecords.length} relevant cases related to your query: "${query}". The most similar case has a ${(topSimilarity * 100).toFixed(1)}% similarity match.\n\n${context.substring(0, 1200)}...`,
      
      `Analysis of ${similarRecords.length} clinically similar cases:\n\nTop match (${(topSimilarity * 100).toFixed(1)}% similarity): Subject ${similarRecords[0]?.subject_id}\n\n${context.substring(0, 1000)}...\n\nWould you like me to focus on specific clinical aspects or patterns?`,
      
      `From the MIMIC IV data, I've identified ${similarRecords.length} relevant patient records with similarity scores ranging from ${(topSimilarity * 100).toFixed(1)}% to ${((similarRecords[similarRecords.length - 1]?.similarity_score || 0) * 100).toFixed(1)}%.\n\nKey clinical findings:\n${context.substring(0, 1000)}...`,
      
      `Vector search results for "${query}":\n\n${similarRecords.length} matching clinical records found. The analysis shows patterns across multiple patients with the highest similarity being ${(topSimilarity * 100).toFixed(1)}%.\n\n${context.substring(0, 1200)}...`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const simulateStreamingResponse = async (responseText: string, sources: string[]) => {
    const words = responseText.split(' ');
    
    const assistantMessageId = Date.now().toString();
    const newAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      sources
    };
    
    setMessages(prev => [...prev, newAssistantMessage]);
    
    // Simulate streaming by adding words gradually
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50)); // Faster streaming
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: words.slice(0, i + 1).join(' ') }
          : msg
      ));
    }
  };

  const sendMessage = async (
    query: string, 
    subjectId: string, 
    availableSubjectIds: number[], 
    selectedModel: string
  ) => {
    if (!query.trim()) {
      toast({
        title: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    console.log('useChat: Starting message send process...');
    console.log('useChat: Initial state - isBackendConnected:', isBackendConnected);
    console.log('useChat: Initial state - isVectorStoreReady:', isVectorStoreReady);

    // First ensure backend connection and vector store readiness
    if (!isBackendConnected || !isVectorStoreReady) {
      console.log('useChat: Backend or vector store not ready, attempting connection check...');
      const connected = await checkBackendConnection();
      if (!connected) {
        toast({
          title: "Backend not connected",
          description: "Could not connect to the backend service. Please ensure it's running on http://localhost:8000",
          variant: "destructive",
        });
        return;
      }
      
      // After connection check, wait a moment for state to propagate and then check again
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('useChat: After connection check - isVectorStoreReady:', isVectorStoreReady);
    }

    // Get fresh state values by calling the hook functions directly
    const vectorStore = useVectorStore();
    const currentBackendStatus = vectorStore.isBackendConnected;
    const currentVectorStoreStatus = vectorStore.isVectorStoreReady;
    
    console.log('useChat: Fresh state check - backend:', currentBackendStatus, 'vectorStore:', currentVectorStoreStatus);
    
    if (!currentBackendStatus) {
      toast({
        title: "Backend not connected",
        description: "Backend connection failed. Please check the Vector Store tab.",
        variant: "destructive",
      });
      return;
    }

    if (!currentVectorStoreStatus) {
      toast({
        title: "Vector store not ready",
        description: "Please vectorize your data first in the Vector Store tab",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    try {
      console.log('useChat: Performing backend vector search for query:', query);
      
      // Perform backend vector search with subject filter if specified
      const similarRecords = await searchSimilar(query, 5, subjectId || undefined);
      
      if (similarRecords.length === 0) {
        throw new Error('No similar records found in the backend vector store');
      }

      console.log(`useChat: Found ${similarRecords.length} similar records from backend`);
      
      // Generate response based on similar records
      const responseText = await generateResponse(query, similarRecords);
      
      // Create sources from similar records with similarity scores
      const sources = similarRecords.map(record => 
        `Subject ${record.subject_id} - ${record.note_id} (${(record.similarity_score * 100).toFixed(1)}% match)`
      );

      await simulateStreamingResponse(responseText, sources);
      
      toast({
        title: "Response generated",
        description: `Found ${similarRecords.length} similar records using backend vector search`,
      });
    } catch (error) {
      console.error('useChat: Chat error:', error);
      toast({
        title: "Error generating response",
        description: error instanceof Error ? error.message : "Backend service error occurred",
        variant: "destructive",
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    toast({
      title: "Conversation cleared",
    });
  };

  return {
    messages,
    isStreaming,
    sendMessage,
    clearConversation
  };
};
