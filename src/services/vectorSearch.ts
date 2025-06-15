
import { pipeline, Pipeline } from '@huggingface/transformers';

interface MimicRecord {
  note_id: string;
  subject_id: number;
  hadm_id: number;
  charttime: string;
  cleaned_text: string;
}

interface VectorizedRecord extends MimicRecord {
  embedding: number[];
}

export class VectorSearchService {
  private embedder: Pipeline | null = null;
  private vectorizedRecords: VectorizedRecord[] = [];
  private isLoading = false;

  async initialize() {
    if (this.embedder || this.isLoading) return;
    
    this.isLoading = true;
    try {
      console.log('Initializing embedding model...');
      this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('Embedding model initialized successfully');
    } catch (error) {
      console.error('Failed to initialize embedding model:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async vectorizeData(records: MimicRecord[], onProgress?: (progress: number) => void): Promise<VectorizedRecord[]> {
    if (!this.embedder) {
      await this.initialize();
    }

    const vectorizedRecords: VectorizedRecord[] = [];
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      try {
        // Truncate text to avoid token limits
        const text = record.cleaned_text.substring(0, 512);
        const embedding = await this.embedder(text, { pooling: 'mean', normalize: true });
        
        vectorizedRecords.push({
          ...record,
          embedding: Array.from(embedding.data)
        });

        if (onProgress) {
          onProgress((i + 1) / records.length * 100);
        }
      } catch (error) {
        console.error(`Failed to vectorize record ${record.note_id}:`, error);
      }
    }

    this.vectorizedRecords = vectorizedRecords;
    return vectorizedRecords;
  }

  async searchSimilar(query: string, topK = 5): Promise<VectorizedRecord[]> {
    if (!this.embedder || this.vectorizedRecords.length === 0) {
      throw new Error('Vector search not initialized or no data vectorized');
    }

    // Get query embedding
    const queryEmbedding = await this.embedder(query, { pooling: 'mean', normalize: true });
    const queryVector = Array.from(queryEmbedding.data);

    // Calculate cosine similarity with all records
    const similarities = this.vectorizedRecords.map(record => ({
      record,
      similarity: this.cosineSimilarity(queryVector, record.embedding)
    }));

    // Sort by similarity and return top K
    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, topK).map(item => item.record);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  getVectorizedRecords(): VectorizedRecord[] {
    return this.vectorizedRecords;
  }

  clearData() {
    this.vectorizedRecords = [];
  }
}

export const vectorSearchService = new VectorSearchService();
