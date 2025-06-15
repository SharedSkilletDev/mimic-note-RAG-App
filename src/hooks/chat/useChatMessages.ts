
import { useState } from 'react';
import { Message } from './types';

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addUserMessage = (content: string): Message => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    return userMessage;
  };

  const removeUserMessage = (content: string) => {
    setMessages(prev => prev.filter(msg => msg.role !== 'user' || msg.content !== content));
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    setMessages,
    addUserMessage,
    removeUserMessage,
    clearMessages
  };
};
