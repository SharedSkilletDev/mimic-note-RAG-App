
import { pipeline } from '@huggingface/transformers';

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
  private embedder: any = null;
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

  async vectorizeData(records: any[], onProgress?: (progress: number) => void): Promise<VectorizedRecord[]> {
    if (!this.embedder) {
      await this.initialize();
    }

    console.log('Starting vectorization process...');
    console.log('Raw input data:', records.slice(0, 2)); // Log first 2 records to see structure

    // Convert and validate the input data
    const validRecords: MimicRecord[] = [];
    
    for (const record of records) {
      try {
        // Handle different possible data structures
        let mimicRecord: MimicRecord;
        
        if (record.note_id && record.cleaned_text) {
          // Direct MIMIC structure
          mimicRecord = {
            note_id: String(record.note_id),
            subject_id: Number(record.subject_id) || 0,
            hadm_id: Number(record.hadm_id) || 0,
            charttime: String(record.charttime || ''),
            cleaned_text: String(record.cleaned_text)
          };
        } else if (record.text || record.content) {
          // Alternative structure with text/content field
          mimicRecord = {
            note_id: String(record.id || record.note_id || Date.now()),
            subject_id: Number(record.subject_id || record.patient_id) || 0,
            hadm_id: Number(record.hadm_id || record.admission_id) || 0,
            charttime: String(record.charttime || record.date || ''),
            cleaned_text: String(record.text || record.content)
          };
        } else {
          console.warn('Skipping record with invalid structure:', record);
          continue;
        }

        // Validate that we have essential fields
        if (mimicRecord.cleaned_text && mimicRecord.cleaned_text.trim().length > 0) {
          validRecords.push(mimicRecord);
        } else {
          console.warn('Skipping record with empty text:', mimicRecord);
        }
      } catch (error) {
        console.error('Error processing record:', record, error);
      }
    }

    console.log(`Processed ${validRecords.length} valid records out of ${records.length} total records`);

    if (validRecords.length === 0) {
      console.error('No valid records found to vectorize');
      return [];
    }

    const vectorizedRecords: VectorizedRecord[] = [];
    
    for (let i = 0; i < validRecords.length; i++) {
      const record = validRecords[i];
      try {
        // Truncate text to avoid token limits and ensure it's not empty
        const text = record.cleaned_text.trim().substring(0, 512);
        
        if (text.length === 0) {
          console.warn(`Skipping record ${record.note_id} - empty text after processing`);
          continue;
        }

        console.log(`Vectorizing record ${i + 1}/${validRecords.length}: ${record.note_id}`);
        
        const embedding = await this.embedder(text, { pooling: 'mean', normalize: true });
        
        // Convert tensor data to number array
        const embeddingArray: number[] = Array.from(embedding.data as Float32Array);
        
        console.log(`Generated embedding of length ${embeddingArray.length} for record ${record.note_id}`);
        
        vectorizedRecords.push({
          ...record,
          embedding: embeddingArray
        });

        if (onProgress) {
          onProgress((i + 1) / validRecords.length * 100);
        }
      } catch (error) {
        console.error(`Failed to vectorize record ${record.note_id}:`, error);
      }
    }

    console.log(`Successfully vectorized ${vectorizedRecords.length} records`);
    this.vectorizedRecords = vectorizedRecords;
    return vectorizedRecords;
  }

  async searchSimilar(query: string, topK = 5): Promise<VectorizedRecord[]> {
    if (!this.embedder || this.vectorizedRecords.length === 0) {
      throw new Error('Vector search not initialized or no data vectorized');
    }

    console.log(`Searching for similar records to: "${query}"`);

    // Get query embedding
    const queryEmbedding = await this.embedder(query, { pooling: 'mean', normalize: true });
    const queryVector: number[] = Array.from(queryEmbedding.data as Float32Array);

    // Calculate cosine similarity with all records
    const similarities = this.vectorizedRecords.map(record => ({
      record,
      similarity: this.cosineSimilarity(queryVector, record.embedding)
    }));

    // Sort by similarity and return top K
    similarities.sort((a, b) => b.similarity - a.similarity);
    const results = similarities.slice(0, topK).map(item => item.record);
    
    console.log(`Found ${results.length} similar records`);
    return results;
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
    console.log('Vector store cleared');
  }
}

export const vectorSearchService = new VectorSearchService();
