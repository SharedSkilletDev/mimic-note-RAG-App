
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface SampleQueriesProps {
  onSelectQuery: (query: string) => void;
}

export const SampleQueries = ({ onSelectQuery }: SampleQueriesProps) => {
  const sampleQueries = [
    "What are the main diagnoses for this patient?",
    "Show me cardiac catheterization procedures",
    "What medications were prescribed at discharge?",
    "Were there any complications during the stay?",
    "What were the vital signs trends?",
    "Summarize the treatment plan"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sample Queries</CardTitle>
        <CardDescription>
          Try these example queries to explore your clinical data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleQueries.map((example, index) => (
            <Button
              key={index}
              variant="outline"
              className="text-left justify-start h-auto p-3"
              onClick={() => onSelectQuery(example)}
            >
              <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{example}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
