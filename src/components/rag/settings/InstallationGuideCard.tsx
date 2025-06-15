
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export const InstallationGuideCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Installation Guide
        </CardTitle>
        <CardDescription>
          Step-by-step setup for your local RAG system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">1. Install Ollama</h4>
            <div className="bg-gray-100 p-3 rounded font-mono text-sm">
              curl -fsSL https://ollama.com/install.sh | sh
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">2. Pull Required Models</h4>
            <div className="bg-gray-100 p-3 rounded font-mono text-sm space-y-1">
              <div>ollama pull nomic-embed-text</div>
              <div>ollama pull llama3.1</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">3. Install Python Dependencies</h4>
            <div className="bg-gray-100 p-3 rounded font-mono text-sm space-y-1">
              <div>pip install llama-index langchain</div>
              <div>pip install faiss-cpu chromadb</div>
              <div>pip install streamlit</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">4. Run Your RAG System</h4>
            <div className="bg-gray-100 p-3 rounded font-mono text-sm">
              python rag_system.py
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
