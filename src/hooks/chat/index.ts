
import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useChatMessages } from './useChatMessages';
import { useChatStreaming } from './useChatStreaming';
import { useFallbackGenerator } from './useFallbackGenerator';
import { useChatAPI } from './useChatAPI';

export const useChat = () => {
  const { toast } = useToast();

  const chatMessages = useChatMessages();
  const chatStreaming = useChatStreaming();
  const fallbackGenerator = useFallbackGenerator();
  const chatAPI = useChatAPI();

  // Destructure after all hooks are initialized
  const {
    messages,
    setMessages,
    addUserMessage,
    removeUserMessage,
    clearMessages
  } = chatMessages;

  const {
    isStreaming,
    setIsStreaming,
    simulateStreamingResponse
  } = chatStreaming;

  const { generateEnhancedFallback } = fallbackGenerator;

  const {
    performVectorSearch,
    generateLLMResponse,
    validateConnectionState,
    createSourceReferences
  } = chatAPI;

  const sendMessage = useCallback(async (
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

    // Validate connection state
    const isValid = await validateConnectionState();
    if (!isValid) return;

    const userMessage = addUserMessage(query);
    setIsStreaming(true);

    try {
      // Perform vector search
      const similarRecords = await performVectorSearch(query, subjectId || undefined);
      const sources = createSourceReferences(similarRecords);

      try {
        // Try to generate LLM response
        const llmResponse = await generateLLMResponse(query, similarRecords, selectedModel);
        
        await simulateStreamingResponse(llmResponse, sources, setMessages);
        
        toast({
          title: "LLM response generated successfully",
          description: `Generated analysis using ${selectedModel}`,
        });
        
      } catch (llmError) {
        console.error('❌ useChat: LLM generation failed, using fallback:', llmError);
        
        // Use fallback generator
        const fallbackResponse = generateEnhancedFallback(query, similarRecords);
        
        await simulateStreamingResponse(fallbackResponse, sources, setMessages);
        
        const isOllamaError = llmError instanceof Error && llmError.message.includes('Ollama not available');
        
        toast({
          title: isOllamaError ? "Response generated (Fallback mode)" : "Response generated (LLM fallback)",
          description: isOllamaError ? "Ollama unavailable - showing enhanced analysis." : "LLM service error - showing enhanced analysis.",
          variant: "default",
        });
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
  }, [
    toast,
    validateConnectionState,
    addUserMessage,
    setIsStreaming,
    performVectorSearch,
    createSourceReferences,
    generateLLMResponse,
    simulateStreamingResponse,
    setMessages,
    generateEnhancedFallback,
    removeUserMessage
  ]);

  const clearConversation = useCallback(() => {
    clearMessages();
    toast({
      title: "Conversation cleared",
    });
  }, [clearMessages, toast]);

  return {
    messages,
    isStreaming,
    sendMessage,
    clearConversation
  };
};

// Re-export types for convenience
export type { Message } from './types';
