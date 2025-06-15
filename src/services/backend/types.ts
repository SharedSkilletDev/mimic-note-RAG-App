
export interface MimicRecord {
  note_id: string;
  subject_id: number;
  hadm_id: number;
  charttime: string;
  cleaned_text: string;
}

export interface VectorSearchResult extends MimicRecord {
  similarity_score: number;
}

export interface VectorizeResponse {
  success: boolean;
  message: string;
  vectorized_count: number;
}

export interface SearchResponse {
  success: boolean;
  results: VectorSearchResult[];
  query: string;
  total_results: number;
}

export interface HealthResponse {
  status: string;
  message: string;
  ollama_available: boolean;
  vector_store_initialized: boolean;
}

export interface StatsResponse {
  total_vectors: number;
  vector_dimension: number;
  unique_subjects: number;
  store_size_mb: number;
}

export interface ClearResponse {
  success: boolean;
  message: string;
}
