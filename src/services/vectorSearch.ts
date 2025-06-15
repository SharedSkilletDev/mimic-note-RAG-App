
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
      console.log('🚀 Initializing embedding model...');
      this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('✅ Embedding model initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize embedding model:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async vectorizeData(records: any[], onProgress?: (progress: number) => void): Promise<VectorizedRecord[]> {
    console.log('=== VECTORIZATION DEBUG START ===');
    console.log('📊 Input records:', records.length);
    console.log('📝 Sample input record:', records[0]);
    
    if (!this.embedder) {
      console.log('🔄 Embedder not initialized, initializing now...');
      await this.initialize();
      
      if (!this.embedder) {
        console.error('❌ Failed to initialize embedder');
        throw new Error('Failed to initialize embedding model');
      }
      console.log('✅ Embedder initialized successfully');
    }

    // Convert and validate the input data with better error handling
    const validRecords: MimicRecord[] = [];
    
    console.log('🔍 Starting record validation...');
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      try {
        // Handle the MIMIC structure more robustly
        let mimicRecord: MimicRecord;
        
        if (record.note_id && record.cleaned_text) {
          mimicRecord = {
            note_id: String(record.note_id),
            subject_id: Number(record.subject_id) || 0,
            hadm_id: Number(record.hadm_id) || 0,
            charttime: String(record.charttime || ''),
            cleaned_text: String(record.cleaned_text).trim()
          };
        } else {
          console.warn(`⚠️ Record ${i + 1} missing required fields`);
          continue;
        }

        // More thorough text validation
        if (!mimicRecord.cleaned_text || mimicRecord.cleaned_text.length < 10) {
          console.warn(`⚠️ Record ${mimicRecord.note_id} has insufficient text content`);
          continue;
        }

        validRecords.push(mimicRecord);
      } catch (error) {
        console.error(`❌ Error processing record ${i + 1}:`, error);
      }
    }

    console.log(`✅ Validation complete: ${validRecords.length} valid records out of ${records.length} total`);

    if (validRecords.length === 0) {
      console.error('❌ No valid records found to vectorize');
      return [];
    }

    const vectorizedRecords: VectorizedRecord[] = [];
    const startTime = Date.now();
    
    console.log('🔮 Starting embedding generation...');
    
    for (let i = 0; i < validRecords.length; i++) {
      const record = validRecords[i];
      console.log(`\n--- 🔮 Vectorizing ${i + 1}/${validRecords.length}: ${record.note_id} ---`);
      
      try {
        // Clean and prepare text for embedding
        let text = record.cleaned_text
          .replace(/\n+/g, ' ')  // Replace multiple newlines with single space
          .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
          .trim();

        // Truncate to a reasonable length for the model
        if (text.length > 512) {
          text = text.substring(0, 512);
          console.log(`✂️ Text truncated to 512 characters`);
        }

        if (text.length === 0) {
          console.warn(`❌ Empty text after cleaning for record ${record.note_id}`);
          continue;
        }

        console.log(`🔮 Generating embedding for text (${text.length} chars)...`);
        console.log(`📝 Text preview: "${text.substring(0, 100)}..."`);
        
        const embeddingStart = Date.now();
        
        try {
          console.log('🔄 Calling embedder...');
          const embedding = await this.embedder(text, { 
            pooling: 'mean', 
            normalize: true 
          });
          
          const embeddingTime = Date.now() - embeddingStart;
          console.log(`⚡ Embedding generated in ${embeddingTime}ms`);
          console.log('📊 Embedding result type:', typeof embedding);
          console.log('📊 Embedding result keys:', Object.keys(embedding || {}));
          
          // Convert tensor data to number array
          let embeddingArray: number[];
          if (embedding && embedding.data) {
            console.log('📊 Using embedding.data');
            embeddingArray = Array.from(embedding.data as Float32Array);
          } else if (Array.isArray(embedding)) {
            console.log('📊 Using embedding as array');
            embeddingArray = embedding;
          } else {
            console.error('❌ Unexpected embedding format:', embedding);
            throw new Error('Unexpected embedding format');
          }
          
          console.log(`✅ Embedding array length: ${embeddingArray.length}`);
          console.log(`🔢 Sample embedding values: [${embeddingArray.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
          
          const vectorizedRecord = {
            ...record,
            embedding: embeddingArray
          };
          
          vectorizedRecords.push(vectorizedRecord);
          console.log(`✅ Successfully vectorized record ${record.note_id}`);

          // Update progress
          const progress = ((i + 1) / validRecords.length) * 100;
          console.log(`📈 Progress: ${progress.toFixed(1)}%`);
          
          if (onProgress) {
            onProgress(progress);
          }
          
        } catch (embeddingError) {
          console.error(`❌ Embedding generation failed for record ${record.note_id}:`, embeddingError);
          console.error('📊 Embedder state:', {
            embedderExists: !!this.embedder,
            textLength: text.length,
            textPreview: text.substring(0, 50)
          });
          // Continue with other records instead of failing completely
        }
      } catch (error) {
        console.error(`❌ Failed to vectorize record ${record.note_id}:`, error);
        // Continue with other records instead of failing completely
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`\n=== 🎉 VECTORIZATION COMPLETE ===`);
    console.log(`⏱️ Total time: ${totalTime}ms`);
    console.log(`✅ Successfully vectorized: ${vectorizedRecords.length}/${validRecords.length} records`);
    
    if (vectorizedRecords.length > 0) {
      console.log(`⚡ Average time per record: ${(totalTime / vectorizedRecords.length).toFixed(2)}ms`);
    }
    
    this.vectorizedRecords = vectorizedRecords;
    console.log(`💾 Vector store now contains ${this.vectorizedRecords.length} records`);
    
    return vectorizedRecords;
  }

  async searchSimilar(query: string, topK = 5): Promise<VectorizedRecord[]> {
    console.log(`\n=== 🔍 VECTOR SEARCH ===`);
    console.log(`❓ Query: "${query}"`);
    console.log(`📊 Available records: ${this.vectorizedRecords.length}`);
    
    if (!this.embedder || this.vectorizedRecords.length === 0) {
      throw new Error('Vector search not initialized or no data vectorized');
    }

    // Get query embedding
    console.log('🔮 Generating query embedding...');
    const queryEmbedding = await this.embedder(query, { pooling: 'mean', normalize: true });
    const queryVector: number[] = Array.from(queryEmbedding.data as Float32Array);
    console.log(`✅ Query embedding generated (length: ${queryVector.length})`);

    // Calculate cosine similarity with all records
    console.log('📊 Calculating similarities...');
    const similarities = this.vectorizedRecords.map((record, index) => {
      const similarity = this.cosineSimilarity(queryVector, record.embedding);
      if (index < 3) { // Log first 3 for debugging
        console.log(`📊 Record ${index + 1} (${record.note_id}): similarity = ${similarity.toFixed(4)}`);
      }
      return {
        record,
        similarity
      };
    });

    // Sort by similarity and return top K
    similarities.sort((a, b) => b.similarity - a.similarity);
    const results = similarities.slice(0, topK).map(item => item.record);
    
    console.log(`\n🏆 Top ${topK} results:`);
    similarities.slice(0, topK).forEach((item, index) => {
      console.log(`${index + 1}. ${item.record.note_id} (similarity: ${item.similarity.toFixed(4)})`);
    });
    
    return results;
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      console.error(`❌ Vector length mismatch: ${vecA.length} vs ${vecB.length}`);
      return 0;
    }
    
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  getVectorizedRecords(): VectorizedRecord[] {
    return this.vectorizedRecords;
  }

  clearData() {
    const previousCount = this.vectorizedRecords.length;
    this.vectorizedRecords = [];
    console.log(`🧹 Vector store cleared (was ${previousCount} records)`);
  }
}

export const vectorSearchService = new VectorSearchService();
