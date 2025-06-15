
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useVectorStore } from './useVectorStore';
import { ollamaLLMService } from '@/services/ollamaLLM';

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
  const { 
    searchSimilar, 
    isVectorStoreReady, 
    isBackendConnected, 
    checkBackendConnection 
  } = useVectorStore();

  const simulateStreamingResponse = async (responseText: string, sources: string[]) => {
    const words = responseText.split(/(\s+)/); // Split on whitespace but keep separators
    
    const assistantMessageId = Date.now().toString();
    const newAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      sources
    };
    
    setMessages(prev => [...prev, newAssistantMessage]);
    
    // Simulate streaming by adding words gradually with natural pacing
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30)); // Slightly slower for better UX
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: words.slice(0, i + 1).join('') }
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

    console.log('🚀 useChat: Starting message send process...');
    console.log('🚀 useChat: Using model:', selectedModel);

    // Validate basic requirements before proceeding
    if (!isBackendConnected) {
      console.log('❌ useChat: Backend not connected, attempting refresh...');
      const refreshResult = await checkBackendConnection();
      console.log('🔄 useChat: Refresh result:', refreshResult);
      
      if (!refreshResult) {
        toast({
          title: "Backend connection failed",
          description: "Could not connect to the backend service. Please check the Vector Store tab and ensure the service is running.",
          variant: "destructive",
        });
        return;
      }

      // Wait for state to update after successful connection
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!isVectorStoreReady) {
      toast({
        title: "Vector store not ready",
        description: "Please ensure your data is vectorized in the Vector Store tab before querying.",
        variant: "destructive",
      });
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    try {
      console.log('🔍 useChat: Performing vector search for query:', query);
      
      // Perform vector search
      const similarRecords = await searchSimilar(query, 5, subjectId || undefined);
      console.log('📊 useChat: Search results:', { count: similarRecords.length, records: similarRecords });
      
      if (!Array.isArray(similarRecords) || similarRecords.length === 0) {
        throw new Error('No similar records found. The vector store may be empty or the search failed.');
      }

      // Check Ollama connection before generating response
      console.log('🤖 useChat: Checking Ollama connection...');
      const ollamaConnected = await ollamaLLMService.checkConnection();
      
      if (!ollamaConnected) {
        console.warn('⚠️ useChat: Ollama not available, falling back to structured summary');
        
        // Fallback to enhanced structured response when Ollama is not available
        const fallbackResponse = `## Clinical Analysis Summary

**Query**: ${query}

### Key Findings
Found ${similarRecords.length} relevant clinical records with high similarity matches.

### Detailed Analysis
${similarRecords.map((record, index) => `
**Record ${index + 1}** (${(record.similarity_score * 100).toFixed(1)}% similarity)
- **Patient**: Subject ID ${record.subject_id}
- **Admission**: ${record.hadm_id}
- **Date**: ${record.charttime}
- **Clinical Context**: ${record.cleaned_text.substring(0, 300)}${record.cleaned_text.length > 300 ? '...' : ''}
`).join('\n')}

### Clinical Insights
The search results indicate relevant clinical patterns related to your query. Each record shows strong semantic similarity, suggesting these cases share important clinical characteristics or outcomes.

*Note: Full LLM analysis requires Ollama connection. Please ensure Ollama is running at http://localhost:11434*`;

        const sources = similarRecords.map(record => 
          `Subject ${record.subject_id} - ${record.note_id} (${(record.similarity_score * 100).toFixed(1)}% match)`
        );

        await simulateStreamingResponse(fallbackResponse, sources);
        
        toast({
          title: "Response generated (Basic mode)",
          description: "Ollama unavailable - showing structured summary. Enable Ollama for full LLM analysis.",
          variant: "default",
        });
        
      } else {
        console.log('🤖 useChat: Generating LLM response...');
        
        // Generate response using Ollama LLM
        const llmResponse = await ollamaLLMService.generateStructuredResponse(
          query, 
          similarRecords, 
          selectedModel
        );
        
        // Create sources from similar records
        const sources = similarRecords.map(record => 
          `Subject ${record.subject_id} - ${record.note_id} (${(record.similarity_score * 100).toFixed(1)}% match)`
        );

        await simulateStreamingResponse(llmResponse, sources);
        
        toast({
          title: "LLM response generated successfully",
          description: `Generated comprehensive analysis using ${selectedModel} with ${similarRecords.length} relevant records`,
        });
      }

    } catch (error) {
      console.error('❌ useChat: Response generation error:', error);
      
      // Remove the user message if we failed to process it
      setMessages(prev => prev.filter(msg => msg.role !== 'user' || msg.content !== query));
      
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
