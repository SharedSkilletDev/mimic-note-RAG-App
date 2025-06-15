
interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export class OllamaLLMService {
  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl: string = 'http://localhost:11434', defaultModel: string = 'llama3.2:latest') {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
  }

  async generateStructuredResponse(
    query: string, 
    similarRecords: any[], 
    model: string = this.defaultModel
  ): Promise<string> {
    // Create detailed context from vector search results
    const contextSections = similarRecords.map((record, index) => {
      return `
**Clinical Record ${index + 1}** (Similarity: ${(record.similarity_score * 100).toFixed(1)}%)
- Patient ID: ${record.subject_id}
- Hospital Admission: ${record.hadm_id}
- Date: ${record.charttime}
- Clinical Notes: ${record.cleaned_text}
      `.trim();
    }).join('\n\n');

    // Create a comprehensive system prompt for medical analysis
    const systemPrompt = `You are an expert clinical data analyst specializing in medical record analysis. Your task is to analyze clinical data from the MIMIC IV database and provide comprehensive, structured responses.

Guidelines for your response:
1. **Structure**: Organize your response with clear sections and headers
2. **Clinical Focus**: Emphasize medical insights and clinical relevance
3. **Evidence-Based**: Reference specific records and similarity scores
4. **Comprehensive**: Provide detailed analysis (aim for 800-1200 tokens)
5. **Professional**: Use appropriate medical terminology while remaining accessible

Response Format:
- **Summary**: Brief overview of findings
- **Key Clinical Insights**: Important medical observations
- **Pattern Analysis**: Trends across similar cases
- **Detailed Findings**: In-depth analysis of each relevant record
- **Clinical Recommendations**: Suggested areas for further investigation`;

    const userPrompt = `
**Query**: ${query}

**Clinical Context**: I found ${similarRecords.length} relevant clinical records with similarity scores ranging from ${(similarRecords[0]?.similarity_score * 100).toFixed(1)}% to ${(similarRecords[similarRecords.length - 1]?.similarity_score * 100).toFixed(1)}%.

**Clinical Records for Analysis**:
${contextSections}

Please provide a comprehensive, structured analysis of these clinical records in relation to the query. Focus on medical insights, patterns, and clinical significance. Aim for a detailed response of approximately 800-1200 tokens.`;

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user', 
              content: userPrompt
            }
          ],
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: 1200,  // Increased token limit for longer responses
            stop: ['<|end|>', '</response>']
          },
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      
      if (data.message && data.message.content) {
        return data.message.content;
      } else {
        throw new Error('Invalid response format from Ollama');
      }

    } catch (error) {
      console.error('Ollama LLM generation failed:', error);
      throw new Error(`Failed to generate LLM response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('Ollama connection check failed:', error);
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        return data.models?.map((model: any) => model.name) || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
      return [];
    }
  }
}

export const ollamaLLMService = new OllamaLLMService();
