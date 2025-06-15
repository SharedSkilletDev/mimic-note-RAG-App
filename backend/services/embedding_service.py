import asyncio
import logging
import numpy as np
from typing import List, Optional
import aiohttp
import json
import time

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self, 
                 ollama_url: str = "http://localhost:11434",
                 model_name: str = "nomic-embed-text"):
        self.ollama_url = ollama_url
<<<<<<< HEAD
        self.model_name = model_name
        self.session = None
        
    async def _get_session(self):
        """Get or create aiohttp session"""
        if self.session is None or self.session.closed:
            timeout = aiohttp.ClientTimeout(total=300)  # 5 minutes timeout
            self.session = aiohttp.ClientSession(timeout=timeout)
        return self.session
=======
        self.model_name = "nomic-embed-text:latest"
        self.embedding_dimension = 768  # Nomic embedding dimension
        self.max_retries = 3
        self.retry_delay = 2  # seconds
>>>>>>> 97a5500787bf8f80ca591fee09b62a2d4b9db0b0
    
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 97a5500787bf8f80ca591fee09b62a2d4b9db0b0
        embeddings = []
        failed_count = 0
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_embeddings = []
            
            for text in batch:
                try:
                    embedding = await self.get_embedding(text)
                    batch_embeddings.append(embedding)
<<<<<<< HEAD
                except Exception as e:
                    logger.error(f"Failed to embed text: {text[:100]}... Error: {e}")
                    # Use zero vector as fallback
                    batch_embeddings.append([0.0] * 768)  # Adjust dimension as needed
            
            embeddings.extend(batch_embeddings)
            
            # Small delay to avoid overwhelming Ollama
            await asyncio.sleep(0.1)
=======
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
>>>>>>> 97a5500787bf8f80ca591fee09b62a2d4b9db0b0
        
        logger.info(f"Batch processing complete. Total successful: {len(embeddings)}, Total failed: {failed_count}")
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