
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { backendVectorService } from '@/services/backend';

export const useBackendConnection = () => {
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000');
  const { toast } = useToast();

  const checkBackendConnection = useCallback(async () => {
    try {
      console.log('🔌 useBackendConnection: Checking backend connection...');
      const connected = await backendVectorService.checkConnection();
      console.log('🔌 useBackendConnection: Connection result:', connected);
      
      setIsBackendConnected(connected);
      
      if (connected) {
        console.log('✅ useBackendConnection: Backend connected successfully');
        toast({
          title: "Backend connected",
          description: "Successfully connected to the vector service",
        });
      } else {
        console.log('❌ useBackendConnection: Backend connection failed');
        toast({
          title: "Backend connection failed",
          description: "Could not connect to the vector service. Make sure it's running on http://localhost:8000",
          variant: "destructive",
        });
      }
      
      return connected;
    } catch (error) {
      console.error('❌ useBackendConnection: Connection check error:', error);
      setIsBackendConnected(false);
      toast({
        title: "Connection error",
        description: "Failed to check backend connection",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const updateBackendUrl = useCallback((url: string) => {
    setBackendUrl(url);
    backendVectorService.setBaseUrl(url);
    setIsBackendConnected(false);
  }, []);

  return {
    isBackendConnected,
    backendUrl,
    checkBackendConnection,
    updateBackendUrl,
  };
};
