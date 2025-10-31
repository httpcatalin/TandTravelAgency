import { useCallback } from 'react';
import { externalApiAuth } from '@/lib/services/externalApiAuth';

export function useExternalApi() {
  const getAuthenticatedRequest = useCallback(async () => {
    const token = await externalApiAuth.getValidToken();
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };
  }, []);

  return {
    getAuthenticatedRequest,
  };
}