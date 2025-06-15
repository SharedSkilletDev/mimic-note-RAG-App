
import { useToast } from "@/hooks/use-toast";
import { useVectorStore } from '../useVectorStore';
import { ollamaLLMService } from '@/services/ollamaLLM';

export const useChatAPI = () => {
  const { toast } = useToast();
  const { 
    searchSimilar, 
    isVectorStoreReady, 
    isBackendConnected, 
    checkBackendConnection 
  } = useVectorStore();

  const performVectorSearch = async (query: string, subjectId?: string) => {
    console.log('🔍 useChatAPI: Performing vector search...');
    
    const similarRecords = await searchSimilar(query, 5, subjectId);
    console.log('📊 useChatAPI: Search results:', { count: similarRecords.length });
    
    if (!Array.isArray(similarRecords) || similarRecords.length === 0) {
      throw new Error('No similar records found.');
    }

    return similarRecords;
  };

  const generateLLMResponse = async (query: string, similarRecords: any[], selectedModel: string) => {
    console.log('🤖 useChatAPI: Checking Ollama connection...');
    const ollamaConnected = await ollamaLLMService.checkConnection();
    console.log('🤖 useChatAPI: Ollama connection status:', ollamaConnected);
    
    if (!ollamaConnected) {
      throw new Error('Ollama not available');
    }

    console.log('🤖 useChatAPI: Generating LLM response...');
    
    const llmResponse = await ollamaLLMService.generateStructuredResponse(
      query, 
      similarRecords, 
      selectedModel
    );
    
    console.log('✅ useChatAPI: LLM response generated successfully');
    console.log('📝 useChatAPI: Response length:', llmResponse.length);
    
    return llmResponse;
  };

  const validateConnectionState = async () => {
    if (!isBackendConnected) {
      console.log('❌ useChatAPI: Backend not connected, attempting refresh...');
      const refreshResult = await checkBackendConnection();
      
      if (!refreshResult) {
        toast({
          title: "Backend connection failed",
          description: "Could not connect to the backend service.",
          variant: "destructive",
        });
        return false;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!isVectorStoreReady) {
      toast({
        title: "Vector store not ready",
        description: "Please ensure your data is vectorized first.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const createSourceReferences = (similarRecords: any[]) => {
    return similarRecords.map(record => 
      `Subject ${record.subject_id} - ${record.note_id} (${(record.similarity_score * 100).toFixed(1)}% match)`
    );
  };

  return {
    performVectorSearch,
    generateLLMResponse,
    validateConnectionState,
    createSourceReferences
  };
};
