
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

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

  const simulateStreamingResponse = async (userMessage: string, subjectId: string) => {
    const responses = [
      "Based on the clinical data you've provided, I can help analyze the discharge notes for patterns related to your query.",
      "Let me search through the MIMIC IV data to find relevant information about your specific question.",
      "I found several relevant cases in the dataset. Here are the key findings from the discharge summaries:",
      "The clinical notes indicate specific patterns that might be relevant to your research question.",
      "Would you like me to dive deeper into any specific aspect of these findings or search for additional related cases?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const words = randomResponse.split(' ');
    
    const assistantMessageId = Date.now().toString();
    const newAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      sources: [`Subject ${subjectId}`, 'MIMIC IV Dataset']
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

    if (!subjectId && availableSubjectIds.length > 0) {
      toast({
        title: "Please select a subject ID",
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
      await simulateStreamingResponse(query, subjectId);
      toast({
        title: "Response generated",
        description: `Using model: ${selectedModel}`,
      });
    } catch (error) {
      toast({
        title: "Error generating response",
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
