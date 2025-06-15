
import React from 'react';
import { User, Bot } from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-lg p-3 ${
            message.role === 'user'
              ? 'bg-blue-600 text-white ml-auto'
              : 'bg-white border'
          }`}
        >
          <p className="text-sm">{message.content}</p>
          {message.sources && (
            <div className="mt-2 text-xs opacity-75">
              Sources: {message.sources.join(', ')}
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
      <div className={`${message.role === 'user' ? 'order-1' : 'order-2'}`}>
        {message.role === 'user' ? (
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-gray-600" />
          </div>
        )}
      </div>
    </div>
  );
};
