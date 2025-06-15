
import { VectorizeResponse } from './types';

export class StreamingResponseHandler {
  static async handleVectorizeStream(
    response: Response,
    onProgress?: (progress: number) => void
  ): Promise<VectorizeResponse> {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalResult: VectorizeResponse | null = null;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              // Handle lines that start with "data: "
              let jsonStr = line.trim();
              if (jsonStr.startsWith('data: ')) {
                jsonStr = jsonStr.substring(6); // Remove "data: " prefix
              }
              
              if (jsonStr) {
                const progressData = JSON.parse(jsonStr);
                
                // Check if this is a progress update
                if (progressData.progress !== undefined && onProgress) {
                  console.log(`📈 Progress: ${progressData.progress}%`);
                  onProgress(progressData.progress);
                }
                
                // Check if this is the final result
                if (progressData.success !== undefined && progressData.vectorized_count !== undefined) {
                  finalResult = progressData as VectorizeResponse;
                }
              }
            } catch (e) {
              console.log('Skipping non-JSON line:', line);
              // Ignore parsing errors for non-JSON lines
            }
          }
        }
      }
    }

    // Process any remaining data in the buffer
    if (buffer.trim()) {
      try {
        let jsonStr = buffer.trim();
        if (jsonStr.startsWith('data: ')) {
          jsonStr = jsonStr.substring(6);
        }
        
        if (jsonStr) {
          const result = JSON.parse(jsonStr);
          if (result.success !== undefined && result.vectorized_count !== undefined) {
            finalResult = result as VectorizeResponse;
          }
        }
      } catch (e) {
        console.log('Failed to parse final buffer:', buffer);
      }
    }

    if (finalResult) {
      console.log('✅ Vectorization complete:', finalResult);
      return finalResult;
    } else {
      throw new Error('No final result received from streaming response');
    }
  }
}
