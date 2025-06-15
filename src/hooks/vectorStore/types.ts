
export interface MimicRecord {
  note_id: string;
  subject_id: number;
  hadm_id: number;
  charttime: string;
  cleaned_text: string;
}

export interface VectorStoreState {
  isVectorizing: boolean;
  vectorizationProgress: number;
  isVectorStoreReady: boolean;
  vectorizedCount: number;
  isBackendConnected: boolean;
  backendUrl: string;
}

export interface VectorizationResult {
  success: boolean;
  vectorized_count: number;
  message?: string;
}

export interface SearchResult {
  success: boolean;
  results: any[];
}

export interface VectorStoreStats {
  total_vectors: number;
  vector_dimension: number;
  unique_subjects: number;
  store_size_mb: number;
}
