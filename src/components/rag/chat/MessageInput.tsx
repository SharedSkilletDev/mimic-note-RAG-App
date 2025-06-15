
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface MessageInputProps {
  query: string;
  setQuery: (query: string) => void;
  onSendMessage: () => void;
  isStreaming: boolean;
}

export const MessageInput = ({ query, setQuery, onSendMessage, isStreaming }: MessageInputProps) => {
  return (
    <div className="flex gap-2">
      <Textarea
        placeholder="Ask a question about your clinical data..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
          }
        }}
        rows={2}
        className="flex-1"
      />
      <Button 
        onClick={onSendMessage} 
        disabled={isStreaming || !query.trim()}
        className="self-end"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};
