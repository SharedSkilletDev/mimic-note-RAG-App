import asyncio
import logging
import httpx
import json
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self, 
                 ollama_url: str = "http://localhost:11434",
                 default_model: str = "llama3.2:latest"):
        self.ollama_url = ollama_url
        self.default_model = default_model
        self.max_retries = 3
        self.retry_delay = 2

    async def check_ollama_connection(self) -> bool:
        """Check if Ollama is running and accessible"""
        try:
            logger.info(f"Checking Ollama LLM connection at {self.ollama_url}")
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.ollama_url}/api/tags")
                if response.status_code == 200:
                    data = response.json()
                    models = [model.get('name', '') for model in data.get('models', [])]
                    logger.info(f"Available LLM models: {models}")
                    
                    # Check if default model is available
                    model_found = any(self.default_model in model for model in models)
                    if not model_found:
                        logger.warning(f"Default model {self.default_model} not found. Available: {models}")
                        # Try to use any available model
                        if models:
                            self.default_model = models[0]
                            logger.info(f"Using available model: {self.default_model}")
                    
                    return True
                else:
                    logger.error(f"Ollama LLM responded with status {response.status_code}")
                    return False
        except Exception as e:
            logger.error(f"Failed to connect to Ollama LLM: {e}")
            return False

    async def generate_response(self, 
                              query: str, 
                              context_records: List[Dict[str, Any]], 
                              model: str = None) -> str:
        """Generate a response using Ollama LLM"""
        if model is None:
            model = self.default_model
            
        # Prepare context from similar records
        context_sections = []
        for i, record in enumerate(context_records):
            context_sections.append(f"""
**Clinical Record {i + 1}** (Similarity: {record.get('similarity_score', 0) * 100:.1f}%)
- Patient ID: {record.get('subject_id', 'N/A')}
- Hospital Admission: {record.get('hadm_id', 'N/A')}
- Chart Date: {record.get('charttime', 'N/A')}
- Clinical Notes: {record.get('cleaned_text', 'N/A')}
            """.strip())
        
        context_text = "\n\n".join(context_sections)
        
        system_prompt = """You are an expert clinical data analyst specializing in medical record analysis from the MIMIC-IV database. Your task is to analyze clinical records and provide comprehensive, well-structured responses.

CRITICAL RESPONSE REQUIREMENTS:
1. **Always provide a complete, structured analysis**
2. **Use clear headings and sections for organization**
3. **Focus on medical insights and clinical relevance**
4. **Reference specific records with evidence**
5. **Provide comprehensive analysis (aim for 1000-1500 tokens)**
6. **Use professional medical terminology while remaining accessible**

REQUIRED RESPONSE STRUCTURE:
- **Clinical Query Analysis**: Brief overview of the question
- **Key Medical Findings**: Important clinical observations from the records
- **Evidence-Based Analysis**: Detailed examination of each relevant record
- **Clinical Patterns & Insights**: Trends and correlations across cases
- **Professional Summary**: Comprehensive clinical interpretation
- **Additional Considerations**: Relevant medical context or recommendations

Ensure your response is thorough, well-organized, and provides maximum clinical value."""

        user_prompt = f"""
**Clinical Query**: {query}

**Available Clinical Evidence**: I have retrieved {len(context_records)} relevant clinical records for analysis.

**Clinical Records for Analysis**:
{context_text}

Please provide a comprehensive, structured clinical analysis of these records in relation to the query. Focus on extracting relevant medical information, identifying patterns, and providing professional clinical insights. Ensure your response is complete and well-organized with clear sections."""

        for attempt in range(self.max_retries):
            try:
                logger.info(f"Generating LLM response (attempt {attempt + 1}) using model: {model}")
                
                async with httpx.AsyncClient(timeout=120.0) as client:
                    response = await client.post(
                        f"{self.ollama_url}/api/chat",
                        json={
                            "model": model,
                            "messages": [
                                {
                                    "role": "system",
                                    "content": system_prompt
                                },
                                {
                                    "role": "user",
                                    "content": user_prompt
                                }
                            ],
                            "options": {
                                "temperature": 0.7,
                                "top_p": 0.9,
                                "num_predict": 1500,
                                "stop": ['<|end|>', '</response>', '<|endoftext|>']
                            },
                            "stream": False
                        }
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('message') and data['message'].get('content'):
                            logger.info("Successfully generated LLM response")
                            return data['message']['content']
                        else:
                            raise Exception("Invalid response format from Ollama")
                    else:
                        error_text = response.text
                        logger.error(f"Ollama API error: {response.status_code} - {error_text}")
                        raise Exception(f"Ollama API error: {response.status_code}")
                        
            except Exception as e:
                if attempt < self.max_retries - 1:
                    logger.warning(f"LLM generation attempt {attempt + 1} failed: {e}. Retrying in {self.retry_delay} seconds...")
                    await asyncio.sleep(self.retry_delay)
                else:
                    logger.error(f"Failed to generate LLM response after {self.max_retries} attempts: {e}")
                    raise

    async def list_available_models(self) -> List[str]:
        """List available models in Ollama"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.ollama_url}/api/tags")
                if response.status_code == 200:
                    data = response.json()
                    return [model.get('name', '') for model in data.get('models', [])]
                return []
        except Exception as e:
            logger.error(f"Failed to list models: {e}")
            return []