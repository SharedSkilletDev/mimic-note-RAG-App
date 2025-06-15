
interface MimicRecord {
  note_id: string;
  subject_id: number;
  hadm_id: number;
  charttime: string;
  cleaned_text: string;
}

interface VectorSearchResult extends MimicRecord {
  similarity_score: number;
}

interface VectorizeResponse {
  success: boolean;
  message: string;
  vectorized_count: number;
}

interface SearchResponse {
  success: boolean;
  results: VectorSearchResult[];
  query: string;
  total_results: number;
}

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
        const data = await response.json();
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

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalResult: VectorizeResponse | null = null;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                // Handle lines that start with "data: "
                let jsonStr = line.trim();
                if (jsonStr.startsWith('data: ')) {
                  jsonStr = jsonStr.substring(6); // Remove "data: " prefix
                }
                
                if (jsonStr) {
                  const progressData = JSON.parse(jsonStr);
                  
                  // Check if this is a progress update
                  if (progressData.progress !== undefined && onProgress) {
                    console.log(`📈 Progress: ${progressData.progress}%`);
                    onProgress(progressData.progress);
                  }
                  
                  // Check if this is the final result
                  if (progressData.success !== undefined && progressData.vectorized_count !== undefined) {
                    finalResult = progressData as VectorizeResponse;
                  }
                }
              } catch (e) {
                console.log('Skipping non-JSON line:', line);
                // Ignore parsing errors for non-JSON lines
              }
            }
          }
        }
      }

      // Process any remaining data in the buffer
      if (buffer.trim()) {
        try {
          let jsonStr = buffer.trim();
          if (jsonStr.startsWith('data: ')) {
            jsonStr = jsonStr.substring(6);
          }
          
          if (jsonStr) {
            const result = JSON.parse(jsonStr);
            if (result.success !== undefined && result.vectorized_count !== undefined) {
              finalResult = result as VectorizeResponse;
            }
          }
        } catch (e) {
          console.log('Failed to parse final buffer:', buffer);
        }
      }

      if (finalResult) {
        console.log('✅ Vectorization complete:', finalResult);
        return finalResult;
      } else {
        throw new Error('No final result received from streaming response');
      }

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

      const result = await response.json();
      console.log(`🏆 Search results:`, result);
      return result;
    } catch (error) {
      console.error('❌ Search failed:', error);
      throw error;
    }
  }

  async getStats() {
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

  async clearVectorStore() {
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

      const result = await response.json();
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

  setBaseUrl(url: string) {
    this.baseUrl = url;
    this.isConnected = false;
  }
}

export const backendVectorService = new BackendVectorService();
