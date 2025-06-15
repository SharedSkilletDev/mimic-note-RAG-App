import asyncio
import logging
import numpy as np
from typing import List, Optional
import aiohttp
import json

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self, 
                 ollama_url: str = "http://localhost:11434",
                 model_name: str = "nomic-embed-text"):
        self.ollama_url = ollama_url
        self.model_name = model_name
        self.session = None
        
    async def _get_session(self):
        """Get or create aiohttp session"""
        if self.session is None or self.session.closed:
            timeout = aiohttp.ClientTimeout(total=300)  # 5 minutes timeout
            self.session = aiohttp.ClientSession(timeout=timeout)
        return self.session
    
    async def check_ollama_connection(self) -> bool:
        """Check if Ollama is running and accessible"""
        try:
            session = await self._get_session()
            async with session.get(f"{self.ollama_url}/api/tags") as response:
                if response.status == 200:
                    data = await response.json()
                    # Check if embedding model is available
                    models = [model.get('name', '') for model in data.get('models', [])]
                    if any(self.model_name in model for model in models):
                        logger.info(f"Ollama is running with {self.model_name} model")
                        return True
                    else:
                        logger.warning(f"Ollama is running but {self.model_name} model not found")
                        logger.info(f"Available models: {models}")
                        return False
                else:
                    logger.error(f"Ollama responded with status {response.status}")
                    return False
        except Exception as e:
            logger.error(f"Failed to connect to Ollama: {e}")
            return False
    
    async def get_embedding(self, text: str) -> List[float]:
        """Generate embedding for given text"""
        try:
            if not text or not text.strip():
                raise ValueError("Text cannot be empty")
                
            session = await self._get_session()
            
            payload = {
                "model": self.model_name,
                "prompt": text.strip()
            }
            
            async with session.post(
                f"{self.ollama_url}/api/embeddings",
                json=payload,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Ollama API error {response.status}: {error_text}")
                    raise Exception(f"Ollama API error: {response.status}")
                
                data = await response.json()
                
                if "embedding" not in data:
                    logger.error(f"No embedding in response: {data}")
                    raise Exception("No embedding returned from Ollama")
                
                embedding = data["embedding"]
                
                if not isinstance(embedding, list) or len(embedding) == 0:
                    raise Exception("Invalid embedding format received")
                
                logger.debug(f"Generated embedding of dimension {len(embedding)}")
                return embedding
                
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise Exception(f"Embedding generation failed: {str(e)}")
    
    async def get_embeddings_batch(self, texts: List[str], batch_size: int = 10) -> List[List[float]]:
        """Generate embeddings for multiple texts in batches"""
        embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_embeddings = []
            
            for text in batch:
                try:
                    embedding = await self.get_embedding(text)
                    batch_embeddings.append(embedding)
                except Exception as e:
                    logger.error(f"Failed to embed text: {text[:100]}... Error: {e}")
                    # Use zero vector as fallback
                    batch_embeddings.append([0.0] * 768)  # Adjust dimension as needed
            
            embeddings.extend(batch_embeddings)
            
            # Small delay to avoid overwhelming Ollama
            await asyncio.sleep(0.1)
        
        return embeddings
    
    async def close(self):
        """Close the aiohttp session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    def __del__(self):
        """Cleanup on deletion"""
        if hasattr(self, 'session') and self.session and not self.session.closed:
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    loop.create_task(self.session.close())
                else:
                    loop.run_until_complete(self.session.close())
            except:
                pass