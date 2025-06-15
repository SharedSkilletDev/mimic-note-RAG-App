
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Clock, User, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QueryResult {
  note_id: string;
  subject_id: number;
  charttime: string;
  relevance_score: number;
  snippet: string;
  full_text: string;
}

export const QueryTab = () => {
  const [query, setQuery] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [results, setResults] = useState<QueryResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate RAG search - in real implementation, this would call your local RAG system
    setTimeout(() => {
      const mockResults: QueryResult[] = [
        {
          note_id: "12103604-DS-13",
          subject_id: 12103604,
          charttime: "2183-04-05",
          relevance_score: 0.92,
          snippet: "Chief Complaint: Chest pain with exertion. Cardiac Catheterization showed 70% stenosis in the distal left main...",
          full_text: "Complete discharge note would be here..."
        },
        {
          note_id: "12103604-DS-12",
          subject_id: 12103604,
          charttime: "2183-04-03",
          relevance_score: 0.87,
          snippet: "Patient presented with chest pain and shortness of breath. EKG showed ST changes...",
          full_text: "Complete discharge note would be here..."
        }
      ];
      
      setResults(mockResults);
      setIsSearching(false);
      
      toast({
        title: "Search completed",
        description: `Found ${mockResults.length} relevant documents`,
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Query Clinical Notes
          </CardTitle>
          <CardDescription>
            Search through your MIMIC IV discharge notes using natural language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Query</label>
            <Textarea
              placeholder="e.g., 'Show me patients with chest pain and cardiac catheterization results'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <User className="h-4 w-4" />
                Subject ID (optional)
              </label>
              <Input
                placeholder="e.g., 12103604"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              />
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

          <Button 
            onClick={handleSearch} 
            disabled={isSearching}
            className="w-full"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Clinical Notes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              Found {results.length} relevant clinical notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Note: {result.note_id}</span>
                    <span className="text-sm text-muted-foreground">
                      Subject: {result.subject_id}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Date: {result.charttime}
                    </span>
                  </div>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    {(result.relevance_score * 100).toFixed(1)}% match
                  </span>
                </div>
                
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm">{result.snippet}</p>
                </div>
                
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  View Full Note
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
              "Patients with cardiac catheterization procedures",
              "Cases involving chest pain and exertion",
              "Discharge notes mentioning stenosis",
              "Patients with coronary artery disease",
              "Cases with specific medication allergies",
              "Notes containing ECG or EKG findings"
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
