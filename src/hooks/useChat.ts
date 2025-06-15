
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
    const words = responseText.split(/(\s+)/);
    
    const assistantMessageId = Date.now().toString();
    const newAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      sources
    };
    
    setMessages(prev => [...prev, newAssistantMessage]);
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 25));
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

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
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

        await simulateStreamingResponse(fallbackResponse, sources);
        
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

          await simulateStreamingResponse(llmResponse, sources);
          
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

          await simulateStreamingResponse(fallbackResponse, sources);
          
          toast({
            title: "Response generated (LLM fallback)",
            description: "LLM service error - showing enhanced analysis.",
            variant: "default",
          });
        }
      }

    } catch (error) {
      console.error('❌ useChat: Response generation error:', error);
      
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

  const generateEnhancedFallback = (query: string, similarRecords: any[]) => {
    const recordAnalysis = similarRecords.map((record, index) => {
      const excerpt = record.cleaned_text.substring(0, 500);
      const hasDischarge = excerpt.toLowerCase().includes('discharge') || 
                          excerpt.toLowerCase().includes('medication') ||
                          excerpt.toLowerCase().includes('prescribed');
      
      return {
        ...record,
        index: index + 1,
        excerpt,
        relevanceNote: hasDischarge ? 'Contains discharge/medication information' : 'General clinical context'
      };
    });

    return `# Clinical Records Analysis

## Query: ${query}

### Executive Summary
Found **${similarRecords.length} relevant clinical records** with similarity scores ranging from **${(similarRecords[similarRecords.length - 1]?.similarity_score * 100).toFixed(1)}%** to **${(similarRecords[0]?.similarity_score * 100).toFixed(1)}%**.

### Detailed Clinical Records

${recordAnalysis.map(record => `
#### Record ${record.index} - ${record.relevanceNote}
- **Patient ID**: ${record.subject_id}
- **Admission ID**: ${record.hadm_id} 
- **Date**: ${record.charttime}
- **Similarity Score**: ${(record.similarity_score * 100).toFixed(1)}%

**Clinical Content**:
${record.excerpt}${record.cleaned_text.length > 500 ? '\n\n*[Content truncated - full record available in source]*' : ''}

---
`).join('')}

### Clinical Insights & Recommendations

**Pattern Analysis**: The retrieved records show semantic similarity to your query about "${query}". Each record represents a clinical encounter that may contain relevant information.

**Next Steps**: 
1. Review each record's full content for specific details
2. Cross-reference admission IDs for complete care episodes
3. Consider temporal relationships between records

**Technical Note**: *This analysis was generated using vector similarity search. For enhanced clinical interpretation with natural language processing, ensure Ollama LLM service is running.*

---
*Analysis generated on ${new Date().toLocaleString()}*`;
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
