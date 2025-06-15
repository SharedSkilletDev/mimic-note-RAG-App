
import asyncio
import logging
import numpy as np
from typing import List
import httpx
import json
import time

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self, ollama_url: str = "http://localhost:11434"):
        self.ollama_url = ollama_url
        self.model_name = "nomic-embed-text:latest"
        self.embedding_dimension = 768  # Nomic embedding dimension
        self.max_retries = 3
        self.retry_delay = 2  # seconds
    
    async def check_ollama_connection(self) -> bool:
        """Check if Ollama is running and the model is available"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Check if Ollama is running
                response = await client.get(f"{self.ollama_url}/api/tags")
                if response.status_code != 200:
                    logger.error("Ollama is not running")
                    return False
                
                # Check if the embedding model is available
                models = response.json()
                model_names = [model["name"] for model in models.get("models", [])]
                
                if self.model_name not in model_names:
                    logger.warning(f"Model {self.model_name} not found. Available models: {model_names}")
                    # Try to pull the model
                    await self._pull_model()
                
                return True
                
        except Exception as e:
            logger.error(f"Failed to connect to Ollama: {e}")
            return False
    
    async def _pull_model(self):
        """Pull the embedding model if it's not available"""
        try:
            logger.info(f"Attempting to pull model: {self.model_name}")
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(
                    f"{self.ollama_url}/api/pull",
                    json={"name": self.model_name}
                )
                if response.status_code == 200:
                    logger.info(f"Successfully pulled model: {self.model_name}")
                else:
                    logger.error(f"Failed to pull model: {response.text}")
        except Exception as e:
            logger.error(f"Error pulling model: {e}")
    
    async def _restart_ollama_if_needed(self) -> bool:
        """Check if Ollama needs to be restarted due to Metal backend issues"""
        try:
            # Wait a bit for Ollama to potentially recover
            await asyncio.sleep(3)
            
            # Test with a simple request
            async with httpx.AsyncClient(timeout=30.0) as client:
                test_response = await client.post(
                    f"{self.ollama_url}/api/embeddings",
                    json={
                        "model": self.model_name,
                        "prompt": "test"
                    }
                )
                return test_response.status_code == 200
        except Exception as e:
            logger.error(f"Ollama restart check failed: {e}")
            return False
    
    async def get_embedding(self, text: str) -> np.ndarray:
        """Generate embedding for a given text using Ollama with retry logic"""
        # Clean and truncate text if too long
        cleaned_text = text.strip()
        if len(cleaned_text) > 8000:  # Limit text length
            cleaned_text = cleaned_text[:8000]
        
        for attempt in range(self.max_retries):
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.post(
                        f"{self.ollama_url}/api/embeddings",
                        json={
                            "model": self.model_name,
                            "prompt": cleaned_text
                        }
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        embedding = np.array(result["embedding"], dtype=np.float32)
                        
                        # Normalize the embedding
                        embedding = embedding / np.linalg.norm(embedding)
                        return embedding
                    
                    elif response.status_code == 500:
                        error_text = response.text
                        if "llama runner process has terminated" in error_text or "failed to create command queue" in error_text:
                            logger.warning(f"Ollama Metal backend failure detected on attempt {attempt + 1}. This is likely due to GPU memory issues.")
                            
                            if attempt < self.max_retries - 1:
                                logger.info(f"Waiting {self.retry_delay} seconds before retry...")
                                await asyncio.sleep(self.retry_delay)
                                
                                # Check if Ollama recovered
                                if await self._restart_ollama_if_needed():
                                    logger.info("Ollama appears to have recovered, retrying...")
                                    continue
                                else:
                                    logger.error("Ollama has not recovered, continuing with next attempt...")
                                    continue
                            else:
                                raise Exception(f"Ollama Metal backend consistently failing. Please restart Ollama with CPU mode: 'OLLAMA_NUM_GPU=0 ollama serve'")
                        else:
                            raise Exception(f"Ollama API error: {response.status_code} - {response.text}")
                    else:
                        raise Exception(f"Ollama API error: {response.status_code} - {response.text}")
                        
            except Exception as e:
                if attempt < self.max_retries - 1:
                    logger.warning(f"Embedding attempt {attempt + 1} failed: {e}. Retrying in {self.retry_delay} seconds...")
                    await asyncio.sleep(self.retry_delay)
                else:
                    logger.error(f"Failed to generate embedding after {self.max_retries} attempts: {e}")
                    raise
    
    async def get_embeddings_batch(self, texts: List[str], batch_size: int = 5) -> List[np.ndarray]:
        """Generate embeddings for multiple texts in batches with reduced batch size for stability"""
        embeddings = []
        failed_count = 0
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_embeddings = []
            
            for text in batch:
                try:
                    embedding = await self.get_embedding(text)
                    batch_embeddings.append(embedding)
                    # Longer delay to prevent overwhelming Ollama
                    await asyncio.sleep(0.5)
                except Exception as e:
                    logger.error(f"Failed to process text in batch: {e}")
                    failed_count += 1
                    continue
            
            embeddings.extend(batch_embeddings)
            logger.info(f"Processed batch {i//batch_size + 1}/{(len(texts) + batch_size - 1)//batch_size}. Success: {len(batch_embeddings)}, Failed: {failed_count}")
            
            # Longer delay between batches to give Ollama time to recover
            if i + batch_size < len(texts):
                await asyncio.sleep(1.0)
        
        logger.info(f"Batch processing complete. Total successful: {len(embeddings)}, Total failed: {failed_count}")
        return embeddings
