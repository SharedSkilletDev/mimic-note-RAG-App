
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const VectorStoreInfoCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Backend Vector Search Architecture</CardTitle>
        <CardDescription>
          Understanding the backend implementation with Nomic embedding and FAISS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">1. Nomic Embedding</h4>
            <p className="text-sm text-muted-foreground">
              Your backend uses Nomic's high-performance embedding model to convert clinical text into dense vector representations with superior semantic understanding.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">2. FAISS Vector Store</h4>
            <p className="text-sm text-muted-foreground">
              Facebook AI Similarity Search (FAISS) provides fast and efficient similarity search capabilities, optimized for large-scale vector operations.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">3. Scalable Architecture</h4>
            <p className="text-sm text-muted-foreground">
              This backend approach can handle much larger datasets and provides faster search performance compared to browser-based solutions.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Backend Requirements</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Python backend with FastAPI or Flask</li>
              <li>• Nomic embedding model installed</li>
              <li>• FAISS library for vector storage</li>
              <li>• Endpoints: /health, /vectorize, /search, /stats, /clear</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
