import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useBackendHealth } from './useBackendHealth';
import type { CustomerForm, InsuranceType, UserProfile, SiteContent, AppSettings } from '../backend';
import { Principal } from '@dfinity/principal';

// Health check aware query wrapper
function useHealthAwareQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  enabled: boolean = true
) {
  const { status: healthStatus } = useBackendHealth();
  
  return useQuery<T>({
    queryKey,
    queryFn,
    enabled: enabled && healthStatus === 'ok',
    retry: (failureCount, error: any) => {
      if (healthStatus === 'unreachable') return false;
      if (error?.message?.includes('Unauthorized')) return false;
      return failureCount < 2;
    },
  });
}

// Admin status check
export function useIsPrimaryAdmin() {
  const { actor, isFetching } = useActor();

  return useHealthAwareQuery(
    ['isAdmin'],
    async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    !!actor && !isFetching
  );
}

// User profile queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
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
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useListAllUserProfiles() {
  const { actor, isFetching } = useActor();

  return useHealthAwareQuery(
    ['allUserProfiles'],
    async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listAllUserProfiles();
    },
    !!actor && !isFetching
  );
}

export function useUpdateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, profile }: { user: Principal; profile: UserProfile }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserProfile(user, profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}

// Admin login
export function useAdminLoginWithPassword() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (password: string) => {
      if (!actor) throw new Error('Actor not available');
      const success = await actor.adminLoginWithPassword(password);
      if (!success) {
        throw new Error('Incorrect password');
      }
      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
  });
}

// Customer forms
export function useGetAllForms() {
  const { actor, isFetching } = useActor();

  return useHealthAwareQuery(
    ['customerForms'],
    async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllForms();
    },
    !!actor && !isFetching
  );
}

export function useSubmitForm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: {
      name: string;
      phone: string;
      email: string;
      address: string;
      interests: InsuranceType[];
      feedback: string;
      documents: any[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitForm(
        formData.name,
        formData.phone,
        formData.email,
        formData.address,
        formData.interests,
        formData.feedback,
        formData.documents
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerForms'] });
    },
  });
}

// Site content
export function useGetSiteContent() {
  const { actor, isFetching } = useActor();

  return useHealthAwareQuery(
    ['siteContent'],
    async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSiteContent();
    },
    !!actor && !isFetching
  );
}

export function useUpdateSiteContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: SiteContent) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSiteContent(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteContent'] });
    },
  });
}

// App settings
export function useGetAppSettings() {
  const { actor, isFetching } = useActor();

  return useHealthAwareQuery(
    ['appSettings'],
    async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAppSettings();
    },
    !!actor && !isFetching
  );
}

export function useUpdateAppSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: AppSettings) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAppSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appSettings'] });
    },
  });
}
