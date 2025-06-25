from pydantic import BaseModel
from typing import List, Optional

class MimicRecord(BaseModel):
    note_id: str
    subject_id: int
    hadm_id: int
    charttime: str
    cleaned_text: str

class VectorSearchResult(MimicRecord):
    similarity_score: float

class VectorizeRequest(BaseModel):
    records: List[MimicRecord]

class VectorizeResponse(BaseModel):
    success: bool
    message: str
    vectorized_count: int

class SearchResponse(BaseModel):
    success: bool
    results: List[VectorSearchResult]
    query: str
    total_results: int

class HealthResponse(BaseModel):
    status: str
    message: str
    ollama_available: bool
    vector_store_initialized: bool

class StatsResponse(BaseModel):
    total_vectors: int
    vector_dimension: int
    unique_subjects: int
    store_size_mb: float

class ClearResponse(BaseModel):
    success: bool
    message: str

class LLMRequest(BaseModel):
    query: str
    context_records: List[dict]
    model: Optional[str] = None

class LLMResponse(BaseModel):
    success: bool
    response: str
    model_used: str