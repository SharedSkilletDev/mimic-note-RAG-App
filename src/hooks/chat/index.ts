
import { useToast } from "@/hooks/use-toast";
import { useVectorStore } from '../useVectorStore';
import { ollamaLLMService } from '@/services/ollamaLLM';
import { useChatMessages } from './useChatMessages';
import { useChatStreaming } from './useChatStreaming';
import { useFallbackGenerator } from './useFallbackGenerator';

export const useChat = () => {
  const { toast } = useToast();
  const { 
    searchSimilar, 
    isVectorStoreReady, 
    isBackendConnected, 
    checkBackendConnection 
  } = useVectorStore();

  const {
    messages,
    setMessages,
    addUserMessage,
    removeUserMessage,
    clearMessages
  } = useChatMessages();

  const {
    isStreaming,
    setIsStreaming,
    simulateStreamingResponse
  } = useChatStreaming();

  const { generateEnhancedFallback } = useFallbackGenerator();

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

    console.log('🚀 useChat: Starting message send process...');
    console.log('🚀 useChat: Using model:', selectedModel);

    if (!isBackendConnected) {
      console.log('❌ useChat: Backend not connected, attempting refresh...');
      const refreshResult = await checkBackendConnection();
      
      if (!refreshResult) {
        toast({
          title: "Backend connection failed",
          description: "Could not connect to the backend service.",
          variant: "destructive",
        });
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!isVectorStoreReady) {
      toast({
        title: "Vector store not ready",
        description: "Please ensure your data is vectorized first.",
        variant: "destructive",
      });
      return;
    }

    const userMessage = addUserMessage(query);
    setIsStreaming(true);

    try {
      console.log('🔍 useChat: Performing vector search...');
      
      const similarRecords = await searchSimilar(query, 5, subjectId || undefined);
      console.log('📊 useChat: Search results:', { count: similarRecords.length });
      
      if (!Array.isArray(similarRecords) || similarRecords.length === 0) {
        throw new Error('No similar records found.');
      }

      console.log('🤖 useChat: Checking Ollama connection...');
      const ollamaConnected = await ollamaLLMService.checkConnection();
      console.log('🤖 useChat: Ollama connection status:', ollamaConnected);
      
      if (!ollamaConnected) {
        console.warn('⚠️ useChat: Ollama not available, using fallback');
        
        const fallbackResponse = generateEnhancedFallback(query, similarRecords);
        const sources = similarRecords.map(record => 
          `Subject ${record.subject_id} - ${record.note_id} (${(record.similarity_score * 100).toFixed(1)}% match)`
        );

        await simulateStreamingResponse(fallbackResponse, sources, setMessages);
        
        toast({
          title: "Response generated (Fallback mode)",
          description: "Ollama unavailable - showing enhanced analysis.",
          variant: "default",
        });
        
      } else {
        console.log('🤖 useChat: Generating LLM response...');
        
        try {
          const llmResponse = await ollamaLLMService.generateStructuredResponse(
            query, 
            similarRecords, 
            selectedModel
          );
          
          console.log('✅ useChat: LLM response generated successfully');
          console.log('📝 useChat: Response length:', llmResponse.length);
          
          const sources = similarRecords.map(record => 
            `Subject ${record.subject_id} - ${record.note_id} (${(record.similarity_score * 100).toFixed(1)}% match)`
          );

          await simulateStreamingResponse(llmResponse, sources, setMessages);
          
          toast({
            title: "LLM response generated successfully",
            description: `Generated analysis using ${selectedModel}`,
          });
          
        } catch (llmError) {
          console.error('❌ useChat: LLM generation failed, using fallback:', llmError);
          
          const fallbackResponse = generateEnhancedFallback(query, similarRecords);
          const sources = similarRecords.map(record => 
            `Subject ${record.subject_id} - ${record.note_id} (${(record.similarity_score * 100).toFixed(1)}% match)`
          );

          await simulateStreamingResponse(fallbackResponse, sources, setMessages);
          
          toast({
            title: "Response generated (LLM fallback)",
            description: "LLM service error - showing enhanced analysis.",
            variant: "default",
          });
        }
      }

    } catch (error) {
      console.error('❌ useChat: Response generation error:', error);
      
      removeUserMessage(query);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Query failed",
        description: `Failed to generate response: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const clearConversation = () => {
    clearMessages();
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

// Re-export types for convenience
export type { Message } from './types';
