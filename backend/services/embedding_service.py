
import asyncio
import logging
import numpy as np
from typing import List
import httpx
import json

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self, ollama_url: str = "http://localhost:11434"):
        self.ollama_url = ollama_url
        self.model_name = "nomic-embed-text:latest"
        self.embedding_dimension = 768  # Nomic embedding dimension
    
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
    
    async def get_embedding(self, text: str) -> np.ndarray:
        """Generate embedding for a given text using Ollama"""
        try:
            # Clean and truncate text if too long
            cleaned_text = text.strip()
            if len(cleaned_text) > 8000:  # Limit text length
                cleaned_text = cleaned_text[:8000]
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.ollama_url}/api/embeddings",
                    json={
                        "model": self.model_name,
                        "prompt": cleaned_text
                    }
                )
                
                if response.status_code != 200:
                    raise Exception(f"Ollama API error: {response.status_code} - {response.text}")
                
                result = response.json()
                embedding = np.array(result["embedding"], dtype=np.float32)
                
                # Normalize the embedding
                embedding = embedding / np.linalg.norm(embedding)
                
                return embedding
                
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise
    
    async def get_embeddings_batch(self, texts: List[str], batch_size: int = 10) -> List[np.ndarray]:
        """Generate embeddings for multiple texts in batches"""
        embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_embeddings = []
            
            for text in batch:
                embedding = await self.get_embedding(text)
                batch_embeddings.append(embedding)
                # Small delay to prevent overwhelming Ollama
                await asyncio.sleep(0.1)
            
            embeddings.extend(batch_embeddings)
            logger.info(f"Processed batch {i//batch_size + 1}/{(len(texts) + batch_size - 1)//batch_size}")
        
        return embeddings
