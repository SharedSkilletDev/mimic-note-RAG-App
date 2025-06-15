
import React, { useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Trash2 } from "lucide-react";
import { ChatMessage } from './ChatMessage';
import { MessageInput } from './MessageInput';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface ChatInterfaceProps {
  messages: Message[];
  query: string;
  setQuery: (query: string) => void;
  onSendMessage: () => void;
  onClearConversation: () => void;
  isStreaming: boolean;
}

export const ChatInterface = ({ 
  messages, 
  query, 
  setQuery, 
  onSendMessage, 
  onClearConversation, 
  isStreaming 
}: ChatInterfaceProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>RAG Chat Interface</CardTitle>
          <CardDescription>
            Chat with your clinical data using natural language
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onClearConversation}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages Display */}
        <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Start a conversation about your clinical data</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          {isStreaming && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-gray-600" />
              </div>
              <div className="bg-white border rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <MessageInput
          query={query}
          setQuery={setQuery}
          onSendMessage={onSendMessage}
          isStreaming={isStreaming}
        />
      </CardContent>
    </Card>
  );
};
