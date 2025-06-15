
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import json
import logging
from typing import Optional, List
import uvicorn

from models import (
    HealthResponse, 
    VectorizeRequest, 
    VectorizeResponse, 
    SearchResponse, 
    StatsResponse, 
    ClearResponse
)
from services.embedding_service import EmbeddingService
from services.vector_store import VectorStore

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Medical RAG Backend",
    description="Backend service for medical RAG application using Ollama and FAISS",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
embedding_service = EmbeddingService()
vector_store = VectorStore()

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        # Check if Ollama is available
        ollama_status = await embedding_service.check_ollama_connection()
        
        return HealthResponse(
            status="healthy",
            message="Backend service is running",
            ollama_available=ollama_status,
            vector_store_initialized=vector_store.is_initialized()
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@app.post("/vectorize")
async def vectorize_data(request: VectorizeRequest):
    """Vectorize clinical records with streaming progress"""
    try:
        logger.info(f"Starting vectorization of {len(request.records)} records")
        
        async def generate_progress():
            total_records = len(request.records)
            vectorized_count = 0
            
            for i, record in enumerate(request.records):
                try:
                    # Generate embedding for the record
                    embedding = await embedding_service.get_embedding(record.cleaned_text)
                    
                    # Store in vector store
                    vector_store.add_vector(
                        vector_id=record.note_id,
                        embedding=embedding,
                        metadata={
                            "subject_id": record.subject_id,
                            "hadm_id": record.hadm_id,
                            "charttime": record.charttime,
                            "cleaned_text": record.cleaned_text,
                            "note_id": record.note_id
                        }
                    )
                    
                    vectorized_count += 1
                    progress = int((i + 1) / total_records * 100)
                    
                    # Send progress update
                    progress_data = {"progress": progress, "processed": i + 1, "total": total_records}
                    yield f"{json.dumps(progress_data)}\n"
                    
                    # Add small delay to prevent overwhelming
                    await asyncio.sleep(0.01)
                    
                except Exception as e:
                    logger.error(f"Error processing record {record.note_id}: {e}")
                    continue
            
            # Send final result
            result = VectorizeResponse(
                success=True,
                message=f"Successfully vectorized {vectorized_count} out of {total_records} records",
                vectorized_count=vectorized_count
            )
            yield json.dumps(result.dict())
        
        return StreamingResponse(
            generate_progress(),
            media_type="text/plain"
        )
        
    except Exception as e:
        logger.error(f"Vectorization failed: {e}")
        raise HTTPException(status_code=500, detail=f"Vectorization failed: {str(e)}")

@app.get("/search", response_model=SearchResponse)
async def search_similar(
    query: str,
    top_k: int = 5,
    subject_id: Optional[str] = None
):
    """Search for similar clinical records"""
    try:
        logger.info(f"Searching for: '{query}' with top_k={top_k}, subject_id={subject_id}")
        
        if not vector_store.is_initialized():
            raise HTTPException(status_code=400, detail="Vector store not initialized. Please vectorize data first.")
        
        # Generate embedding for the query
        query_embedding = await embedding_service.get_embedding(query)
        
        # Search in vector store
        results = vector_store.search(
            query_embedding=query_embedding,
            top_k=top_k,
            subject_id_filter=int(subject_id) if subject_id else None
        )
        
        logger.info(f"Found {len(results)} similar records")
        
        return SearchResponse(
            success=True,
            results=results,
            query=query,
            total_results=len(results)
        )
        
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/stats", response_model=StatsResponse)
async def get_stats():
    """Get vector store statistics"""
    try:
        if not vector_store.is_initialized():
            raise HTTPException(status_code=400, detail="Vector store not initialized")
        
        stats = vector_store.get_stats()
        
        return StatsResponse(
            total_vectors=stats["total_vectors"],
            vector_dimension=stats["vector_dimension"],
            unique_subjects=stats["unique_subjects"],
            store_size_mb=stats["store_size_mb"]
        )
        
    except Exception as e:
        logger.error(f"Failed to get stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

@app.delete("/clear", response_model=ClearResponse)
async def clear_vector_store():
    """Clear the vector store"""
    try:
        vector_store.clear()
        logger.info("Vector store cleared successfully")
        
        return ClearResponse(
            success=True,
            message="Vector store cleared successfully"
        )
        
    except Exception as e:
        logger.error(f"Failed to clear vector store: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to clear vector store: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
