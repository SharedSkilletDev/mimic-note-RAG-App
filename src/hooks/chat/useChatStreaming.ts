
import { useState } from 'react';
import { Message } from './types';

export const useChatStreaming = () => {
  const [isStreaming, setIsStreaming] = useState(false);

  const simulateStreamingResponse = async (
    responseText: string, 
    sources: string[],
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  ) => {
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

  return {
    isStreaming,
    setIsStreaming,
    simulateStreamingResponse
  };
};
