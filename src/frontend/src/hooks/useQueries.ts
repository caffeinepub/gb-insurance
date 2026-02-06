import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useBackendHealth } from './useBackendHealth';
import type { CustomerForm, InsuranceType, UserProfile } from '../backend';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { logOnce } from '../utils/logOnce';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const profile = await actor.getCallerUserProfile();
      return profile;
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 0,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) {
        throw new Error('Backend connection not available. Please try again.');
      }

      if (!profile.name || !profile.name.trim()) {
        throw new Error('Name is required');
      }
      if (!profile.email || !profile.email.trim()) {
        throw new Error('Email is required');
      }
      if (!profile.role || !profile.role.trim()) {
        throw new Error('Role is required');
      }

      await actor.saveCallerUserProfile(profile);
      return profile;
    },
    onMutate: async (newProfile) => {
      await queryClient.cancelQueries({ queryKey: ['currentUserProfile'] });
      const previousProfile = queryClient.getQueryData<UserProfile | null>(['currentUserProfile']);
      queryClient.setQueryData(['currentUserProfile'], newProfile);
      return { previousProfile };
    },
    onSuccess: async (savedProfile) => {
      queryClient.setQueryData(['currentUserProfile'], savedProfile);
      await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });

      toast.success('Profile saved successfully!', {
        description: 'Your administrator profile has been created.',
        duration: 3000,
      });
    },
    onError: (error: Error, _newProfile, context) => {
      if (context?.previousProfile !== undefined) {
        queryClient.setQueryData(['currentUserProfile'], context.previousProfile);
      }

      logOnce('profile-save-error', 'Error saving profile:', error);
      toast.error('Failed to save profile', {
        description: error.message || 'Please check your connection and try again.',
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { status: healthStatus } = useBackendHealth();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error: any) {
        // Check if this is an authorization error vs connectivity error
        if (healthStatus === 'ok') {
          // Backend is reachable but call failed - likely unauthorized
          logOnce('admin-check-unauthorized', 'Admin check failed (unauthorized):', error);
          return false;
        } else {
          // Backend unreachable
          logOnce('admin-check-unreachable', 'Admin check failed (unreachable):', error);
          throw error;
        }
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    retry: (failureCount, error) => {
      // Don't retry if backend is unreachable
      if (healthStatus === 'unreachable') {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: 500,
  });
}

export function useIsPrimaryAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { status: healthStatus } = useBackendHealth();

  return useQuery<boolean>({
    queryKey: ['isPrimaryAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error: any) {
        if (healthStatus === 'ok') {
          logOnce('primary-admin-check-unauthorized', 'Primary admin check failed (unauthorized):', error);
          return false;
        } else {
          logOnce('primary-admin-check-unreachable', 'Primary admin check failed (unreachable):', error);
          throw error;
        }
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    retry: (failureCount, error) => {
      if (healthStatus === 'unreachable') {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 500,
  });
}

export function useAdminLoginWithPassword() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (password: string) => {
      if (!actor) {
        throw new Error('Backend connection not available. Please try again.');
      }

      const success = await actor.adminLoginWithPassword(password);
      if (!success) {
        throw new Error('Incorrect password');
      }
      return success;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      await queryClient.invalidateQueries({ queryKey: ['isPrimaryAdmin'] });

      toast.success('Login successful!', {
        description: 'Welcome back, Administrator.',
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      logOnce('admin-login-error', 'Admin login error:', error);
      toast.error('Login failed', {
        description: error.message || 'Please check your credentials and try again.',
        duration: 5000,
      });
    },
  });
}

export function useResetAdminPassword() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { resetCode: string; newPassword: string }) => {
      if (!actor) {
        throw new Error('Backend connection not available. Please try again.');
      }

      const success = await actor.resetAdminPassword(data.resetCode, data.newPassword);
      if (!success) {
        throw new Error('Failed to reset password');
      }
      return success;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      await queryClient.invalidateQueries({ queryKey: ['isPrimaryAdmin'] });

      toast.success('Password reset successful!', {
        description: 'Your admin credentials have been updated.',
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      logOnce('reset-password-error', 'Reset password error:', error);
      toast.error('Reset failed', {
        description: error.message || 'Please check your reset code and try again.',
        duration: 5000,
      });
    },
  });
}

export function useSubmitForm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      phone: string;
      email: string;
      address: string;
      insuranceInterests: InsuranceType[];
      feedback: string;
      documents: ExternalBlob[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitForm(
        data.name,
        data.phone,
        data.email,
        data.address,
        data.insuranceInterests,
        data.feedback,
        data.documents
      );
    },
    onSuccess: () => {
      toast.success('Form submitted successfully! We will contact you soon.');
      queryClient.invalidateQueries({ queryKey: ['allForms'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit form: ${error.message}`);
    },
  });
}

export function useGetAllForms() {
  const { actor, isFetching: actorFetching } = useActor();
  const { status: healthStatus } = useBackendHealth();

  return useQuery<CustomerForm[]>({
    queryKey: ['allForms'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllForms();
      } catch (error: any) {
        if (healthStatus === 'ok') {
          // Backend is reachable but call failed - likely unauthorized
          logOnce('forms-fetch-unauthorized', 'Forms fetch failed (unauthorized):', error);
        } else {
          logOnce('forms-fetch-unreachable', 'Forms fetch failed (unreachable):', error);
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: (failureCount, error) => {
      // Don't retry if backend is unreachable
      if (healthStatus === 'unreachable') {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });
}
