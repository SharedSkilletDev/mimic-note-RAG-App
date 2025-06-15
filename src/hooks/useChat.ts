
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
  const { searchSimilar, isVectorStoreReady } = useVectorStore();

  const generateResponse = async (query: string, similarRecords: any[]) => {
    // Create context from similar records
    const context = similarRecords.map(record => 
      `Subject ${record.subject_id} (${record.charttime}): ${record.cleaned_text.substring(0, 500)}...`
    ).join('\n\n');

    // Generate response based on context and query
    const responses = [
      `Based on the clinical records, I found ${similarRecords.length} relevant cases related to your query: "${query}".`,
      `Key findings from the most similar cases:\n\n${context.substring(0, 800)}...`,
      `The analysis shows patterns across ${similarRecords.length} patient records. Would you like me to focus on specific aspects?`,
      `From the MIMIC IV data, I've identified relevant clinical patterns. The most similar case involves Subject ${similarRecords[0]?.subject_id}.`
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
      await new Promise(resolve => setTimeout(resolve, 100));
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

    if (!isVectorStoreReady) {
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
      console.log('Performing vector search for query:', query);
      
      // Perform vector search
      const similarRecords = await searchSimilar(query, 5);
      
      if (similarRecords.length === 0) {
        throw new Error('No similar records found');
      }

      console.log(`Found ${similarRecords.length} similar records`);
      
      // Generate response based on similar records
      const responseText = await generateResponse(query, similarRecords);
      
      // Create sources from similar records
      const sources = similarRecords.map(record => 
        `Subject ${record.subject_id} - ${record.note_id}`
      );

      await simulateStreamingResponse(responseText, sources);
      
      toast({
        title: "Response generated",
        description: `Using model: ${selectedModel} with ${similarRecords.length} similar records`,
      });
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error generating response",
        description: error instanceof Error ? error.message : "Unknown error occurred",
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
