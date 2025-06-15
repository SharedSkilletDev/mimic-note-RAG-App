
import { MimicRecord, VectorizeResponse, SearchResponse, HealthResponse, StatsResponse, ClearResponse } from './types';
import { StreamingResponseHandler } from './streamingUtils';

export class BackendVectorService {
  private baseUrl: string;
  private isConnected = false;

  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  async checkConnection(): Promise<boolean> {
    try {
      console.log('🔌 Checking backend connection...');
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data: HealthResponse = await response.json();
        console.log('✅ Backend connected:', data);
        this.isConnected = true;
        return true;
      } else {
        console.error('❌ Backend connection failed:', response.statusText);
        this.isConnected = false;
        return false;
      }
    } catch (error) {
      console.error('❌ Backend connection error:', error);
      this.isConnected = false;
      return false;
    }
  }

  async vectorizeData(records: MimicRecord[], onProgress?: (progress: number) => void): Promise<VectorizeResponse> {
    console.log('=== BACKEND VECTORIZATION START ===');
    console.log(`📊 Sending ${records.length} records to backend`);

    try {
      const response = await fetch(`${this.baseUrl}/vectorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await StreamingResponseHandler.handleVectorizeStream(response, onProgress);
    } catch (error) {
      console.error('❌ Vectorization failed:', error);
      throw error;
    }
  }

  async searchSimilar(query: string, topK = 5, subjectId?: string): Promise<SearchResponse> {
    console.log(`\n=== 🔍 BACKEND VECTOR SEARCH ===`);
    console.log(`❓ Query: "${query}"`);
    console.log(`📊 Top K: ${topK}`);
    if (subjectId) {
      console.log(`👤 Subject ID filter: ${subjectId}`);
    }

    try {
      const searchParams = new URLSearchParams({
        query,
        top_k: topK.toString(),
      });

      if (subjectId) {
        searchParams.append('subject_id', subjectId);
      }

      const response = await fetch(`${this.baseUrl}/search?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: SearchResponse = await response.json();
      console.log(`🏆 Search results:`, result);
      return result;
    } catch (error) {
      console.error('❌ Search failed:', error);
      throw error;
    }
  }

  async getStats(): Promise<StatsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      throw error;
    }
  }

  async clearVectorStore(): Promise<ClearResponse> {
    console.log('🧹 Clearing vector store...');
    try {
      const response = await fetch(`${this.baseUrl}/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ClearResponse = await response.json();
      console.log('✅ Vector store cleared:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to clear vector store:', error);
      throw error;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
    this.isConnected = false;
  }
}
