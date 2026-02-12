import { useQuery } from '@tanstack/react-query';
import { createActorWithConfig } from '../config';

export type HealthStatus = 'ok' | 'unreachable' | 'error';

export interface UseBackendHealthResult {
  status: HealthStatus;
  isChecking: boolean;
  refetch: () => void;
}

/**
 * Hook to check backend health and connectivity
 * Uses getVisitorCount as a simple health check (public query, no auth required)
 */
export function useBackendHealth(): UseBackendHealthResult {
  const query = useQuery<boolean, Error>({
    queryKey: ['backendHealth'],
    queryFn: async () => {
      try {
        // Create an anonymous actor to test connectivity
        const actor = await createActorWithConfig();
        // Use getVisitorCount as a simple health check (public query)
        await actor.getVisitorCount();
        return true;
      } catch (error) {
        console.error('Health check failed:', error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 10000, // Consider health status fresh for 10 seconds
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
  });

  const status: HealthStatus = query.isError 
    ? 'unreachable' 
    : query.data === true 
      ? 'ok' 
      : 'error';

  return {
    status,
    isChecking: query.isLoading || query.isFetching,
    refetch: query.refetch,
  };
}
