#!/usr/bin/env python3
"""
Test script to verify Ollama connection and functionality
"""
import asyncio
import httpx
import json

async def test_ollama_connection():
    """Test basic Ollama connection"""
    print("🔌 Testing Ollama connection...")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get("http://localhost:11434/api/tags")
            if response.status_code == 200:
                data = response.json()
                models = [model.get('name', '') for model in data.get('models', [])]
                print(f"✅ Ollama is running!")
                print(f"📋 Available models: {models}")
                return True, models
            else:
                print(f"❌ Ollama responded with status {response.status_code}")
                return False, []
    except Exception as e:
        print(f"❌ Failed to connect to Ollama: {e}")
        return False, []

async def test_embedding_model():
    """Test embedding model"""
    print("\n🔮 Testing embedding model...")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "http://localhost:11434/api/embeddings",
                json={
                    "model": "nomic-embed-text:latest",
                    "prompt": "This is a test sentence for embedding generation."
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if "embedding" in data:
                    embedding_length = len(data["embedding"])
                    print(f"✅ Embedding model working! Generated {embedding_length}-dimensional embedding")
                    return True
                else:
                    print("❌ No embedding in response")
                    return False
            else:
                print(f"❌ Embedding request failed with status {response.status_code}")
                print(f"Response: {response.text}")
                return False
    except Exception as e:
        print(f"❌ Embedding test failed: {e}")
        return False

async def test_llm_model():
    """Test LLM model"""
    print("\n🤖 Testing LLM model...")
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "http://localhost:11434/api/chat",
                json={
                    "model": "llama3.2:latest",
                    "messages": [
                        {
                            "role": "user",
                            "content": "Hello! Please respond with a brief greeting."
                        }
                    ],
                    "stream": False
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('message') and data['message'].get('content'):
                    print(f"✅ LLM model working!")
                    print(f"📝 Response: {data['message']['content'][:100]}...")
                    return True
                else:
                    print("❌ Invalid LLM response format")
                    return False
            else:
                print(f"❌ LLM request failed with status {response.status_code}")
                print(f"Response: {response.text}")
                return False
    except Exception as e:
        print(f"❌ LLM test failed: {e}")
        return False

async def pull_required_models():
    """Pull required models if they don't exist"""
    print("\n📥 Checking and pulling required models...")
    
    required_models = ["nomic-embed-text:latest", "llama3.2:latest"]
    
    for model in required_models:
        print(f"📥 Pulling {model}...")
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                response = await client.post(
                    "http://localhost:11434/api/pull",
                    json={"name": model}
                )
                
                if response.status_code == 200:
                    print(f"✅ Successfully pulled {model}")
                else:
                    print(f"❌ Failed to pull {model}: {response.text}")
        except Exception as e:
            print(f"❌ Error pulling {model}: {e}")

async def main():
    """Main test function"""
    print("🚀 Starting Ollama connectivity tests...\n")
    
    # Test basic connection
    connected, models = await test_ollama_connection()
    
    if not connected:
        print("\n❌ Ollama is not running or not accessible.")
        print("💡 Please start Ollama with: ollama serve")
        return
    
    # Check if required models exist
    required_models = ["nomic-embed-text", "llama3.2"]
    missing_models = []
    
    for required in required_models:
        if not any(required in model for model in models):
            missing_models.append(required)
    
    if missing_models:
        print(f"\n⚠️  Missing required models: {missing_models}")
        await pull_required_models()
        
        # Recheck models
        connected, models = await test_ollama_connection()
    
    # Test embedding functionality
    embedding_works = await test_embedding_model()
    
    # Test LLM functionality
    llm_works = await test_llm_model()
    
    # Summary
    print("\n" + "="*50)
    print("📊 TEST SUMMARY")
    print("="*50)
    print(f"Ollama Connection: {'✅ PASS' if connected else '❌ FAIL'}")
    print(f"Embedding Model:   {'✅ PASS' if embedding_works else '❌ FAIL'}")
    print(f"LLM Model:         {'✅ PASS' if llm_works else '❌ FAIL'}")
    
    if connected and embedding_works and llm_works:
        print("\n🎉 All tests passed! Your Ollama setup is ready for the RAG system.")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
        
        if not connected:
            print("💡 Start Ollama: ollama serve")
        if not embedding_works:
            print("💡 Pull embedding model: ollama pull nomic-embed-text:latest")
        if not llm_works:
            print("💡 Pull LLM model: ollama pull llama3.2:latest")

if __name__ == "__main__":
    asyncio.run(main())