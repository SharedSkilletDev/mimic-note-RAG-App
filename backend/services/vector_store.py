import faiss
import numpy as np
import pickle
import os
import logging
from typing import List, Dict, Any, Optional
from models import VectorSearchResult

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self, 
                 index_path: str = "faiss_index.bin",
                 metadata_path: str = "metadata.pkl",
                 dimension: int = 768):  # Common dimension for nomic-embed-text
        self.index_path = index_path
        self.metadata_path = metadata_path
        self.dimension = dimension
        self.index = None
        self.metadata = {}
        self.id_to_index = {}
        self.index_to_id = {}
        self.next_index = 0
        
        # Try to load existing index
        self._load_index()
    
    def _load_index(self):
        """Load existing FAISS index and metadata"""
        try:
            if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
                # Load FAISS index
                self.index = faiss.read_index(self.index_path)
                logger.info(f"Loaded FAISS index with {self.index.ntotal} vectors")
                
                # Load metadata
                with open(self.metadata_path, 'rb') as f:
                    data = pickle.load(f)
                    self.metadata = data.get('metadata', {})
                    self.id_to_index = data.get('id_to_index', {})
                    self.index_to_id = data.get('index_to_id', {})
                    self.next_index = data.get('next_index', 0)
                    self.dimension = data.get('dimension', self.dimension)
                
                logger.info(f"Loaded metadata for {len(self.metadata)} records")
                return True
            else:
                logger.info("No existing index found, will create new one")
                return False
        except Exception as e:
            logger.error(f"Failed to load existing index: {e}")
            self._initialize_new_index()
            return False
    
    def _initialize_new_index(self):
        """Initialize a new FAISS index"""
        try:
            # Create a new FAISS index (Inner Product for cosine similarity)
            self.index = faiss.IndexFlatIP(self.dimension)
            self.metadata = {}
            self.id_to_index = {}
            self.index_to_id = {}
            self.next_index = 0
            logger.info(f"Initialized new FAISS index with dimension {self.dimension}")
        except Exception as e:
            logger.error(f"Failed to initialize new index: {e}")
            raise
    
    def is_initialized(self) -> bool:
        """Check if the vector store is initialized"""
        return self.index is not None
    
    def add_vector(self, vector_id: str, embedding: List[float], metadata: Dict[str, Any]):
        """Add a vector to the store"""
        try:
            if not self.is_initialized():
                self._initialize_new_index()
            
            # Convert embedding to numpy array and normalize for cosine similarity
            vector = np.array(embedding, dtype=np.float32).reshape(1, -1)
            
            # Normalize vector for cosine similarity with IndexFlatIP
            faiss.normalize_L2(vector)
            
            # Check if this vector_id already exists
            if vector_id in self.id_to_index:
                logger.warning(f"Vector {vector_id} already exists, skipping")
                return
            
            # Add to FAISS index
            self.index.add(vector)
            
            # Store mappings
            current_index = self.next_index
            self.id_to_index[vector_id] = current_index
            self.index_to_id[current_index] = vector_id
            self.metadata[vector_id] = metadata
            self.next_index += 1
            
            logger.debug(f"Added vector {vector_id} at index {current_index}")
            
        except Exception as e:
            logger.error(f"Failed to add vector {vector_id}: {e}")
            raise
    
    def search(self, 
              query_embedding: List[float], 
              top_k: int = 5,
              subject_id_filter: Optional[int] = None) -> List[VectorSearchResult]:
        """Search for similar vectors"""
        try:
            if not self.is_initialized() or self.index.ntotal == 0:
                logger.warning("No vectors in store")
                return []
            
            # Convert query to numpy array and normalize
            query_vector = np.array(query_embedding, dtype=np.float32).reshape(1, -1)
            faiss.normalize_L2(query_vector)
            
            # Perform search
            search_k = min(top_k * 3, self.index.ntotal)  # Search more to allow for filtering
            similarities, indices = self.index.search(query_vector, search_k)
            
            results = []
            for similarity, idx in zip(similarities[0], indices[0]):
                if idx == -1:  # Invalid index
                    continue
                
                vector_id = self.index_to_id.get(idx)
                if not vector_id or vector_id not in self.metadata:
                    continue
                
                metadata = self.metadata[vector_id]
                
                # Apply subject_id filter if specified
                if subject_id_filter is not None:
                    if metadata.get('subject_id') != subject_id_filter:
                        continue
                
                # Create result object
                result = VectorSearchResult(
                    note_id=metadata['note_id'],
                    subject_id=metadata['subject_id'],
                    hadm_id=metadata['hadm_id'],
                    charttime=metadata['charttime'],
                    cleaned_text=metadata['cleaned_text'],
                    similarity_score=float(similarity)
                )
                
                results.append(result)
                
                if len(results) >= top_k:
                    break
            
            logger.info(f"Found {len(results)} similar vectors")
            return results
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            raise
    
    def save_index(self):
        """Save the FAISS index and metadata to disk"""
        try:
            if not self.is_initialized():
                logger.warning("No index to save")
                return
            
            # Save FAISS index
            faiss.write_index(self.index, self.index_path)
            
            # Save metadata
            data = {
                'metadata': self.metadata,
                'id_to_index': self.id_to_index,
                'index_to_id': self.index_to_id,
                'next_index': self.next_index,
                'dimension': self.dimension
            }
            
            with open(self.metadata_path, 'wb') as f:
                pickle.dump(data, f)
            
            logger.info(f"Saved index with {self.index.ntotal} vectors")
            
        except Exception as e:
            logger.error(f"Failed to save index: {e}")
            raise
    
    def clear(self):
        """Clear the vector store"""
        try:
            # Remove files
            if os.path.exists(self.index_path):
                os.remove(self.index_path)
            if os.path.exists(self.metadata_path):
                os.remove(self.metadata_path)
            
            # Reset in-memory structures
            self._initialize_new_index()
            
            logger.info("Cleared vector store")
            
        except Exception as e:
            logger.error(f"Failed to clear vector store: {e}")
            raise
    
    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about the vector store"""
        try:
            if not self.is_initialized():
                return {
                    "total_vectors": 0,
                    "vector_dimension": self.dimension,
                    "unique_subjects": 0,
                    "store_size_mb": 0.0
                }
            
            # Calculate unique subjects
            unique_subjects = set()
            for metadata in self.metadata.values():
                unique_subjects.add(metadata.get('subject_id'))
            
            # Calculate file sizes
            store_size = 0
            if os.path.exists(self.index_path):
                store_size += os.path.getsize(self.index_path)
            if os.path.exists(self.metadata_path):
                store_size += os.path.getsize(self.metadata_path)
            
            return {
                "total_vectors": self.index.ntotal,
                "vector_dimension": self.dimension,
                "unique_subjects": len(unique_subjects),
                "store_size_mb": round(store_size / (1024 * 1024), 2)
            }
            
        except Exception as e:
            logger.error(f"Failed to get stats: {e}")
            raise
    
    def __del__(self):
        """Save index on deletion"""
        try:
            if self.is_initialized() and self.index.ntotal > 0:
                self.save_index()
        except:
            pass