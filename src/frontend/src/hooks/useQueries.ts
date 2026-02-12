import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';
import { useBackendHealth } from './useBackendHealth';
import { Principal } from '@dfinity/principal';

// Customer Form Queries
export function useGetAllForms() {
  const { actor, isFetching: actorFetching } = useActor();
  const { status: healthStatus } = useBackendHealth();

  return useQuery({
    queryKey: ['customerForms'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllForms();
    },
    enabled: !!actor && !actorFetching && healthStatus === 'ok',
    retry: false,
  });
}

export function useSubmitForm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      phone: string;
      address: string;
      attachments: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      await actor.submitForm(
        data.name,
        data.email,
        data.phone,
        data.address,
        data.attachments
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerForms'] });
    },
  });
}

export function useIsPrimaryAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isPrimaryAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.isCallerAdmin();
      } catch (error: any) {
        // Surface errors instead of silent failure
        console.error('Admin status check failed:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1, // Allow one retry
    retryDelay: 1000,
  });
}

// First Admin Creation
export function useCreateFirstAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // Use empty strings as tokens since we're creating the first admin
      // The backend will handle the first-admin creation logic
      await actor.initializeAdmin('', '');
    },
    onSuccess: () => {
      // Invalidate admin status to trigger re-check
      queryClient.invalidateQueries({ queryKey: ['isPrimaryAdmin'] });
    },
  });
}

// Admin Management Queries
export function useListAdmins() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['admins'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.listAdmins();
      } catch (error: any) {
        console.error('Failed to list admins:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
  });
}

export function useAddAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAdmin: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addAdmin(newAdmin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
}

export function useRemoveAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminToRemove: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeAdmin(adminToRemove);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
}
