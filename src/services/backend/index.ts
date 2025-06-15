
import { BackendVectorService } from './BackendVectorService';

export const backendVectorService = new BackendVectorService();

// Re-export types and classes for external use
export { BackendVectorService } from './BackendVectorService';
export { StreamingResponseHandler } from './streamingUtils';
export * from './types';
