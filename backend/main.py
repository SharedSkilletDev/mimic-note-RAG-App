from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import json
import logging
from typing import Optional, List
import uvicorn
import atexit
import signal
import sys

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
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
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
embedding_service = None
vector_store = None

def initialize_services():
    """Initialize services with error handling"""
    global embedding_service, vector_store
    try:
        embedding_service = EmbeddingService()
        vector_store = VectorStore()
        logger.info("Services initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        return False

def cleanup_services():
    """Cleanup services on shutdown"""
    global embedding_service, vector_store
    try:
        if vector_store and vector_store.is_initialized():
            vector_store.save_index()
            logger.info("Saved vector store index")
        
        if embedding_service:
            asyncio.create_task(embedding_service.close())
            logger.info("Closed embedding service")
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")

# Initialize services on startup
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    success = initialize_services()
    if not success:
        logger.error("Failed to initialize services - some endpoints may not work")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    cleanup_services()

# Register cleanup handlers
atexit.register(cleanup_services)
signal.signal(signal.SIGTERM, lambda signum, frame: sys.exit(0))
signal.signal(signal.SIGINT, lambda signum, frame: sys.exit(0))

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        if not embedding_service or not vector_store:
            return HealthResponse(
                status="unhealthy",
                message="Services not initialized",
                ollama_available=False,
                vector_store_initialized=False
            )
        
        # Check if Ollama is available
        ollama_status = await embedding_service.check_ollama_connection()
        
        return HealthResponse(
            status="healthy" if ollama_status else "degraded",
            message="Backend service is running" if ollama_status else "Ollama not available",
            ollama_available=ollama_status,
            vector_store_initialized=vector_store.is_initialized()
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="unhealthy",
            message=f"Health check failed: {str(e)}",
            ollama_available=False,
            vector_store_initialized=False
        )

@app.post("/vectorize")
async def vectorize_data(request: VectorizeRequest):
    """Vectorize clinical records with streaming progress and better error handling"""
    try:
        if not embedding_service or not vector_store:
            raise HTTPException(status_code=500, detail="Services not initialized")
        
        logger.info(f"Starting vectorization of {len(request.records)} records")
        
        async def generate_progress():
            total_records = len(request.records)
            vectorized_count = 0
<<<<<<< HEAD
            errors = []
=======
            failed_count = 0
            metal_error_detected = False
>>>>>>> 97a5500787bf8f80ca591fee09b62a2d4b9db0b0
            
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
                    progress_data = {
                        "progress": progress, 
                        "processed": i + 1, 
                        "total": total_records,
<<<<<<< HEAD
                        "status": "processing"
                    }
                    yield f"data: {json.dumps(progress_data)}\n\n"
                    
                    # Save index periodically
                    if vectorized_count % 100 == 0:
                        vector_store.save_index()
                        logger.info(f"Saved index at {vectorized_count} records")
=======
                        "successful": vectorized_count,
                        "failed": failed_count
                    }
                    yield f"{json.dumps(progress_data)}\n"
>>>>>>> 97a5500787bf8f80ca591fee09b62a2d4b9db0b0
                    
                except Exception as e:
<<<<<<< HEAD
                    error_msg = f"Error processing record {record.note_id}: {str(e)}"
                    logger.error(error_msg)
                    errors.append(error_msg)
                    continue
            
            # Save final index
            try:
                vector_store.save_index()
                logger.info("Final index save completed")
            except Exception as e:
                logger.error(f"Failed to save final index: {e}")
            
            # Send final result
            result = {
                "success": True,
                "message": f"Successfully vectorized {vectorized_count} out of {total_records} records",
                "vectorized_count": vectorized_count,
                "errors": errors[:10] if errors else [],  # Limit error messages
                "status": "completed"
            }
            yield f"data: {json.dumps(result)}\n\n"
=======
                    failed_count += 1
                    error_msg = str(e)
                    
                    # Check for Metal backend errors
                    if "failed to create command queue" in error_msg or "llama runner process has terminated" in error_msg:
                        metal_error_detected = True
                        logger.error(f"Metal backend error detected for record {record.note_id}: {e}")
                    else:
                        logger.error(f"Error processing record {record.note_id}: {e}")
                    
                    # Send error update
                    error_data = {
                        "progress": int((i + 1) / total_records * 100),
                        "processed": i + 1,
                        "total": total_records,
                        "successful": vectorized_count,
                        "failed": failed_count,
                        "error": "Metal backend issues detected" if metal_error_detected else "Processing error"
                    }
                    yield f"{json.dumps(error_data)}\n"
                    continue
            
            # Send final result with troubleshooting info
            success_rate = (vectorized_count / total_records * 100) if total_records > 0 else 0
            message = f"Successfully vectorized {vectorized_count} out of {total_records} records ({success_rate:.1f}%)"
            
            if metal_error_detected:
                message += "\n\nIMPORTANT: Metal backend errors detected. To fix this:\n1. Stop Ollama: 'ollama stop'\n2. Restart with CPU mode: 'OLLAMA_NUM_GPU=0 ollama serve'\n3. Or increase available GPU memory"
            
            if failed_count > 0:
                message += f"\n{failed_count} records failed to process."
            
            result = VectorizeResponse(
                success=vectorized_count > 0,
                message=message,
                vectorized_count=vectorized_count
            )
            yield json.dumps(result.dict())
>>>>>>> 97a5500787bf8f80ca591fee09b62a2d4b9db0b0
        
        return StreamingResponse(
            generate_progress(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
        
    except Exception as e:
        logger.error(f"Vectorization failed: {e}")
        error_message = str(e)
        if "Metal backend" in error_message or "failed to create command queue" in error_message:
            error_message += " - Try restarting Ollama with: OLLAMA_NUM_GPU=0 ollama serve"
        raise HTTPException(status_code=500, detail=f"Vectorization failed: {error_message}")

@app.get("/search", response_model=SearchResponse)
async def search_similar(
    query: str,
    top_k: int = 5,
    subject_id: Optional[str] = None
):
    """Search for similar clinical records"""
    try:
        if not embedding_service or not vector_store:
            raise HTTPException(status_code=500, detail="Services not initialized")
        
        logger.info(f"Searching for: '{query}' with top_k={top_k}, subject_id={subject_id}")
        
        if not vector_store.is_initialized():
            raise HTTPException(status_code=400, detail="Vector store not initialized. Please vectorize data first.")
        
        # Check if vector store has any data
        stats = vector_store.get_stats()
        if stats["total_vectors"] == 0:
            raise HTTPException(status_code=400, detail="No vectors in store. Please vectorize data first.")
        
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
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Search failed: {e}")
        error_message = str(e)
        if "Metal backend" in error_message or "failed to create command queue" in error_message:
            error_message += " - Try restarting Ollama with: OLLAMA_NUM_GPU=0 ollama serve"
        raise HTTPException(status_code=500, detail=f"Search failed: {error_message}")

# ... keep existing code (stats, clear, and main endpoints)

@app.get("/stats", response_model=StatsResponse)
async def get_stats():
    """Get vector store statistics"""
    try:
        if not vector_store:
            raise HTTPException(status_code=500, detail="Vector store not initialized")
        
        if not vector_store.is_initialized():
            return StatsResponse(
                total_vectors=0,
                vector_dimension=768,
                unique_subjects=0,
                store_size_mb=0.0
            )
        
        stats = vector_store.get_stats()
        
        return StatsResponse(
            total_vectors=stats["total_vectors"],
            vector_dimension=stats["vector_dimension"],
            unique_subjects=stats["unique_subjects"],
            store_size_mb=stats["store_size_mb"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

@app.delete("/clear", response_model=ClearResponse)
async def clear_vector_store():
    """Clear the vector store"""
    try:
        if not vector_store:
            raise HTTPException(status_code=500, detail="Vector store not initialized")
        
        vector_store.clear()
        logger.info("Vector store cleared successfully")
        
        return ClearResponse(
            success=True,
            message="Vector store cleared successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to clear vector store: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to clear vector store: {str(e)}")

@app.get("/debug/info")
async def debug_info():
    """Debug endpoint to check service status"""
    return {
        "embedding_service_initialized": embedding_service is not None,
        "vector_store_initialized": vector_store is not None and vector_store.is_initialized(),
        "vector_store_stats": vector_store.get_stats() if vector_store and vector_store.is_initialized() else None,
        "ollama_status": await embedding_service.check_ollama_connection() if embedding_service else False
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )