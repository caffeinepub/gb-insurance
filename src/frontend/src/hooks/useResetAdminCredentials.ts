import { useState, useEffect } from 'react';
import { useInternetIdentity } from './useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { createActorWithConfig } from '../config';
import { categorizeBackendError, type CategorizedError } from '../utils/backendErrorMapping';
import type { backendInterface } from '../backend';

export type ResetState = 
  | 'idle'
  | 'initializing-actor'
  | 'resetting'
  | 'success'
  | 'error';

export interface UseResetAdminCredentialsResult {
  resetPassword: (resetCode: string, newPassword: string) => Promise<void>;
  state: ResetState;
  error: CategorizedError | null;
  isAuthenticated: boolean;
  requiresAuth: boolean;
  retry: () => void;
}

/**
 * Dedicated hook for admin password reset flow
 * Handles actor initialization independently and enforces Internet Identity authentication
 */
export function useResetAdminCredentials(): UseResetAdminCredentialsResult {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [state, setState] = useState<ResetState>('idle');
  const [error, setError] = useState<CategorizedError | null>(null);
  const [actor, setActor] = useState<backendInterface | null>(null);
  const [actorInitError, setActorInitError] = useState<Error | null>(null);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const requiresAuth = !isAuthenticated;

  // Initialize actor when identity changes
  useEffect(() => {
    let mounted = true;

    const initActor = async () => {
      if (!mounted) return;

      setState('initializing-actor');
      setActorInitError(null);

      try {
        // Create actor with current identity (or anonymous if not authenticated)
        // Admin token is best-effort - don't fail if missing
        const actorOptions = identity ? {
          agentOptions: {
            identity
          }
        } : undefined;

        const newActor = await createActorWithConfig(actorOptions);
        
        if (mounted) {
          setActor(newActor);
          setState('idle');
        }
      } catch (err) {
        console.error('Failed to initialize actor for reset:', err);
        if (mounted) {
          setActorInitError(err instanceof Error ? err : new Error(String(err)));
          setState('error');
          setError(categorizeBackendError(err));
        }
      }
    };

    initActor();

    return () => {
      mounted = false;
    };
  }, [identity]);

  const resetPassword = async (resetCode: string, newPassword: string): Promise<void> => {
    // Clear previous errors
    setError(null);

    // Check authentication first
    if (!isAuthenticated) {
      const authError = new Error('You must sign in with Internet Identity before resetting admin credentials.');
      setError(categorizeBackendError(authError));
      setState('error');
      throw authError;
    }

    // Check actor availability
    if (!actor) {
      if (actorInitError) {
        setError(categorizeBackendError(actorInitError));
        setState('error');
        throw actorInitError;
      }
      const noActorError = new Error('Backend connection not available. Please retry.');
      setError(categorizeBackendError(noActorError));
      setState('error');
      throw noActorError;
    }

    setState('resetting');

    try {
      const success = await actor.resetAdminPassword(resetCode, newPassword);
      
      if (!success) {
        throw new Error('Reset failed. Please check your reset code and try again.');
      }

      setState('success');

      // Invalidate admin status queries to refresh UI
      await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      await queryClient.invalidateQueries({ queryKey: ['isPrimaryAdmin'] });

    } catch (err) {
      console.error('Reset password error:', err);
      const categorized = categorizeBackendError(err);
      setError(categorized);
      setState('error');
      throw err;
    }
  };

  const retry = () => {
    setState('idle');
    setError(null);
    setActorInitError(null);
    // Re-trigger actor initialization by forcing a re-render
    setActor(null);
  };

  return {
    resetPassword,
    state,
    error,
    isAuthenticated,
    requiresAuth,
    retry,
  };
}
