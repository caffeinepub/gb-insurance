import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { CustomerForm, InsuranceType, UserProfile } from '../backend';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

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
    staleTime: 0, // Always fetch fresh data
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
      
      // Validate profile data on frontend
      if (!profile.name || !profile.name.trim()) {
        throw new Error('Name is required');
      }
      if (!profile.email || !profile.email.trim()) {
        throw new Error('Email is required');
      }
      if (!profile.role || !profile.role.trim()) {
        throw new Error('Role is required');
      }

      // Call backend to save profile - returns void, throws on error
      await actor.saveCallerUserProfile(profile);
      
      // Return the profile for cache updates
      return profile;
    },
    onMutate: async (newProfile) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['currentUserProfile'] });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<UserProfile | null>(['currentUserProfile']);

      // Optimistically update to the new value
      queryClient.setQueryData(['currentUserProfile'], newProfile);

      // Return context with the previous value
      return { previousProfile };
    },
    onSuccess: async (savedProfile) => {
      // Ensure the cache is updated with the saved profile
      queryClient.setQueryData(['currentUserProfile'], savedProfile);
      
      // Invalidate and refetch to ensure consistency with backend
      await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      
      // Also invalidate admin status queries
      await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      
      // Show success toast
      toast.success('Profile saved successfully!', {
        description: 'Your administrator profile has been created.',
        duration: 3000,
      });
    },
    onError: (error: Error, _newProfile, context) => {
      // Rollback to previous value on error
      if (context?.previousProfile !== undefined) {
        queryClient.setQueryData(['currentUserProfile'], context.previousProfile);
      }
      
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile', {
        description: error.message || 'Please check your connection and try again.',
        duration: 5000,
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    retry: 2,
    retryDelay: 500,
  });
}

// Use isCallerAdmin as a proxy for primary admin check since backend doesn't have isPrimaryAdmin
export function useIsPrimaryAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isPrimaryAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        // Use isCallerAdmin since isPrimaryAdmin doesn't exist in backend
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(500 * (attemptIndex + 1), 2000),
  });
}

// Customer Form Queries
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
      // Invalidate forms query to trigger automatic refresh in dashboard
      queryClient.invalidateQueries({ queryKey: ['allForms'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit form: ${error.message}`);
    },
  });
}

// Dashboard Queries with improved error recovery and automatic refresh
export function useGetAllForms() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CustomerForm[]>({
    queryKey: ['allForms'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllForms();
      } catch (error) {
        console.error('Error fetching forms:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    refetchInterval: 30000, // Auto-refresh every 30 seconds for real-time updates
    refetchIntervalInBackground: false, // Only refresh when tab is active
  });
}
