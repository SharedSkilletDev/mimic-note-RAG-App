
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Clock, User, FileText, Send, Bot, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface QueryResult {
  note_id: string;
  subject_id: number;
  charttime: string;
  relevance_score: number;
  snippet: string;
  full_text: string;
}

interface MimicRecord {
  note_id: string;
  subject_id: number;
  hadm_id: number;
  charttime: string;
  cleaned_text: string;
}

interface QueryTabProps {
  uploadedData?: MimicRecord[];
}

export const QueryTab = ({ uploadedData = [] }: QueryTabProps) => {
  const [query, setQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('llama3.2:latest');
  const [subjectId, setSubjectId] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [availableModels] = useState([
    'llama3.2:latest',
    'llama3.1:8b',
    'mistral:latest',
    'gemma2',
    'summarizer:latest',
    'nomic-embed-text:latest'
  ]);
  const [context, setContext] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(`You are a helpful AI assistant specialized in analyzing clinical data from MIMIC IV dataset. 
You have access to discharge summaries and clinical notes. Please provide accurate, helpful responses based on the provided context.
Always cite your sources when referencing specific patient data.`);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get unique subject IDs from uploaded data
  const availableSubjectIds = React.useMemo(() => {
    const uniqueIds = [...new Set(uploadedData.map(record => record.subject_id))];
    return uniqueIds.sort((a, b) => a - b);
  }, [uploadedData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateStreamingResponse = async (userMessage: string) => {
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

  const handleSendMessage = async () => {
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
    setQuery('');
    setIsStreaming(true);

    try {
      await simulateStreamingResponse(query);
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

  const refreshModels = () => {
    toast({
      title: "Models refreshed",
      description: "Available Ollama models updated",
    });
  };

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            RAG Configuration
          </CardTitle>
          <CardDescription>
            Configure your RAG system settings and select data parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ollama Model</label>
              <div className="flex gap-2">
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {availableModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={refreshModels}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Models available on your local Ollama instance
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <User className="h-4 w-4" />
                Subject ID
              </label>
              {availableSubjectIds.length > 0 ? (
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select subject ID" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {availableSubjectIds.map((id) => (
                      <SelectItem key={id} value={id.toString()}>
                        Subject {id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 text-sm text-muted-foreground border rounded">
                  No data uploaded
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Date Range (optional)
              </label>
              <Input
                placeholder="e.g., 2183-04-01 to 2183-04-30"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">System Prompt</label>
            <Textarea
              placeholder="Configure the system prompt for the AI assistant..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>RAG Chat Interface</CardTitle>
            <CardDescription>
              Chat with your clinical data using natural language
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={clearConversation}>
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
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
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
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask a question about your clinical data..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={2}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isStreaming || !query.trim()}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sample Queries */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Queries</CardTitle>
          <CardDescription>
            Try these example queries to explore your clinical data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "What are the main diagnoses for this patient?",
              "Show me cardiac catheterization procedures",
              "What medications were prescribed at discharge?",
              "Were there any complications during the stay?",
              "What were the vital signs trends?",
              "Summarize the treatment plan"
            ].map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left justify-start h-auto p-3"
                onClick={() => setQuery(example)}
              >
                <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{example}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
