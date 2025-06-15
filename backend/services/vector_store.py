
import faiss
import numpy as np
import pickle
import os
import logging
from typing import List, Dict, Any, Optional
import json

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self, store_path: str = "vector_store"):
        self.store_path = store_path
        self.index = None
        self.metadata = {}
        self.dimension = 768  # Nomic embedding dimension
        self.index_file = os.path.join(store_path, "faiss_index.idx")
        self.metadata_file = os.path.join(store_path, "metadata.pkl")
        
        # Create store directory
        os.makedirs(store_path, exist_ok=True)
        
        # Try to load existing index
        self._load_index()
    
    def _load_index(self):
        """Load existing FAISS index and metadata"""
        try:
            if os.path.exists(self.index_file) and os.path.exists(self.metadata_file):
                # Load FAISS index
                self.index = faiss.read_index(self.index_file)
                
                # Load metadata
                with open(self.metadata_file, 'rb') as f:
                    self.metadata = pickle.load(f)
                
                logger.info(f"Loaded existing index with {self.index.ntotal} vectors")
            else:
                self._initialize_index()
                
        except Exception as e:
            logger.error(f"Failed to load index: {e}")
            self._initialize_index()
    
    def _initialize_index(self):
        """Initialize a new FAISS index"""
        try:
            # Create a new FAISS index (Inner Product for cosine similarity with normalized vectors)
            self.index = faiss.IndexFlatIP(self.dimension)
            self.metadata = {}
            logger.info("Initialized new FAISS index")
        except Exception as e:
            logger.error(f"Failed to initialize index: {e}")
            raise
    
    def _save_index(self):
        """Save FAISS index and metadata to disk"""
        try:
            # Save FAISS index
            faiss.write_index(self.index, self.index_file)
            
            # Save metadata
            with open(self.metadata_file, 'wb') as f:
                pickle.dump(self.metadata, f)
                
            logger.info("Index and metadata saved successfully")
        except Exception as e:
            logger.error(f"Failed to save index: {e}")
            raise
    
    def add_vector(self, vector_id: str, embedding: np.ndarray, metadata: Dict[str, Any]):
        """Add a vector to the store"""
        try:
            if self.index is None:
                self._initialize_index()
            
            # Ensure embedding is the right shape and normalized
            if embedding.shape[0] != self.dimension:
                raise ValueError(f"Embedding dimension {embedding.shape[0]} doesn't match expected {self.dimension}")
            
            # Normalize the embedding
            embedding = embedding / np.linalg.norm(embedding)
            
            # Add to FAISS index
            embedding_2d = embedding.reshape(1, -1).astype(np.float32)
            self.index.add(embedding_2d)
            
            # Store metadata with the current index position
            current_index = self.index.ntotal - 1
            self.metadata[current_index] = {
                "vector_id": vector_id,
                **metadata
            }
            
            # Save periodically (every 100 vectors)
            if self.index.ntotal % 100 == 0:
                self._save_index()
            
        except Exception as e:
            logger.error(f"Failed to add vector {vector_id}: {e}")
            raise
    
    def search(self, query_embedding: np.ndarray, top_k: int = 5, subject_id_filter: Optional[int] = None) -> List[Dict[str, Any]]:
        """Search for similar vectors"""
        try:
            if self.index is None or self.index.ntotal == 0:
                return []
            
            # Normalize query embedding
            query_embedding = query_embedding / np.linalg.norm(query_embedding)
            query_2d = query_embedding.reshape(1, -1).astype(np.float32)
            
            # Search in FAISS index
            # Get more results than needed in case we need to filter
            search_k = min(top_k * 5, self.index.ntotal) if subject_id_filter else top_k
            scores, indices = self.index.search(query_2d, search_k)
            
            results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx == -1:  # FAISS returns -1 for invalid indices
                    continue
                
                if idx not in self.metadata:
                    continue
                
                metadata = self.metadata[idx]
                
                # Apply subject_id filter if specified
                if subject_id_filter and metadata.get("subject_id") != subject_id_filter:
                    continue
                
                result = {
                    "note_id": metadata["note_id"],
                    "subject_id": metadata["subject_id"],
                    "hadm_id": metadata["hadm_id"],
                    "charttime": metadata["charttime"],
                    "cleaned_text": metadata["cleaned_text"],
                    "similarity_score": float(score)
                }
                results.append(result)
                
                # Stop when we have enough results
                if len(results) >= top_k:
                    break
            
            return results
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            raise
    
    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about the vector store"""
        try:
            if self.index is None:
                return {
                    "total_vectors": 0,
                    "vector_dimension": self.dimension,
                    "unique_subjects": 0,
                    "store_size_mb": 0.0
                }
            
            # Count unique subjects
            unique_subjects = set()
            for metadata in self.metadata.values():
                unique_subjects.add(metadata.get("subject_id"))
            
            # Calculate store size
            store_size = 0
            if os.path.exists(self.index_file):
                store_size += os.path.getsize(self.index_file)
            if os.path.exists(self.metadata_file):
                store_size += os.path.getsize(self.metadata_file)
            
            return {
                "total_vectors": self.index.ntotal,
                "vector_dimension": self.dimension,
                "unique_subjects": len(unique_subjects),
                "store_size_mb": round(store_size / (1024 * 1024), 2)
            }
            
        except Exception as e:
            logger.error(f"Failed to get stats: {e}")
            raise
    
    def clear(self):
        """Clear the vector store"""
        try:
            self._initialize_index()
            
            # Remove files
            if os.path.exists(self.index_file):
                os.remove(self.index_file)
            if os.path.exists(self.metadata_file):
                os.remove(self.metadata_file)
            
            logger.info("Vector store cleared")
        except Exception as e:
            logger.error(f"Failed to clear vector store: {e}")
            raise
    
    def is_initialized(self) -> bool:
        """Check if the vector store is initialized and has data"""
        return self.index is not None and self.index.ntotal > 0
    
    def __del__(self):
        """Save index on destruction"""
        try:
            if self.index is not None and self.index.ntotal > 0:
                self._save_index()
        except:
            pass  # Ignore errors during cleanup
