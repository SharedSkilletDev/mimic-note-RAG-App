
# Medical RAG Backend

FastAPI backend service for the medical RAG application using Ollama embeddings and FAISS vector storage.

## Features

- **Health Check**: Monitor backend and Ollama service status
- **Vectorization**: Convert clinical text to embeddings with streaming progress
- **Vector Search**: Fast similarity search with subject filtering
- **Statistics**: Get vector store metrics
- **Clear Store**: Reset vector database

## Prerequisites

1. **Python 3.8+**
2. **Ollama** installed and running locally
3. **Nomic embedding model** pulled in Ollama

## Setup Instructions

### 1. Install Ollama

```bash
# Install Ollama (if not already installed)
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve
```

### 2. Pull the Nomic Embedding Model

```bash
# Pull the Nomic embedding model
ollama pull nomic-embed-text:latest
```

### 3. Install Python Dependencies

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Run the Backend

```bash
# Start the FastAPI server
python main.py

# Or use uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at `http://localhost:8000`

### 5. Verify Installation

Check the health endpoint:
```bash
curl http://localhost:8000/health
```

You should see:
```json
{
  "status": "healthy",
  "message": "Backend service is running",
  "ollama_available": true,
  "vector_store_initialized": false
}
```

## API Endpoints

### Health Check
- **GET** `/health` - Check service status

### Vectorization
- **POST** `/vectorize` - Convert clinical records to vectors
  - Supports streaming progress updates
  - Automatically saves to FAISS index

### Search
- **GET** `/search?query=<text>&top_k=5&subject_id=<id>` - Search similar records
  - Query parameter: search text
  - top_k: number of results (default: 5)
  - subject_id: filter by specific subject (optional)

### Statistics
- **GET** `/stats` - Get vector store statistics

### Clear Store
- **DELETE** `/clear` - Clear the vector database

## Configuration

### Ollama URL
By default, the service expects Ollama at `http://localhost:11434`. To change this, modify the `EmbeddingService` initialization in `main.py`:

```python
embedding_service = EmbeddingService(ollama_url="http://your-ollama-host:11434")
```

### Vector Store Path
Vector data is stored in the `vector_store/` directory by default. To change this, modify the `VectorStore` initialization in `main.py`:

```python
vector_store = VectorStore(store_path="/path/to/your/store")
```

## Troubleshooting

### Ollama Connection Issues
1. Ensure Ollama is running: `ollama serve`
2. Check if the model is available: `ollama list`
3. Pull the model if missing: `ollama pull nomic-embed-text:latest`

### Memory Issues
For large datasets, consider:
1. Processing data in smaller batches
2. Increasing system memory
3. Using FAISS GPU version if available

### Performance Tuning
1. Adjust batch sizes in embedding service
2. Use SSD storage for vector store
3. Consider FAISS IVF indices for very large datasets

## Development

To run in development mode with auto-reload:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Production Deployment

For production, consider:
1. Use a proper ASGI server like Gunicorn with Uvicorn workers
2. Set up proper logging and monitoring
3. Configure CORS appropriately
4. Use environment variables for configuration
5. Set up proper error handling and rate limiting

Example production command:
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```
