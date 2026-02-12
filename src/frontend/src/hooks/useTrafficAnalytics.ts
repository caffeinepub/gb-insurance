import { useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';

/**
 * Stub implementation for traffic analytics
 * The backend no longer supports visitor tracking
 */
export function useTrafficAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // No-op: backend doesn't support analytics anymore
    console.log('Page view:', location.pathname);
  }, [location.pathname]);
}
