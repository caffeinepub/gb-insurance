import { useState, useMemo } from 'react';
import { useGetAllForms } from '../hooks/useQueries';
import { useBackendHealth } from '../hooks/useBackendHealth';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { categorizeBackendError } from '../utils/backendErrorMapping';
import DashboardStats from './DashboardStats';
import DashboardFilters from './DashboardFilters';
import DashboardTable from './DashboardTable';
import AccessDeniedScreen from './AccessDeniedScreen';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubmissionsDashboardProps {
  showTitle?: boolean;
}

export default function SubmissionsDashboard({ showTitle = false }: SubmissionsDashboardProps) {
  const { data: forms, isLoading, error, refetch } = useGetAllForms();
  const { status: healthStatus, refetch: refetchHealth } = useBackendHealth();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  const filteredAndSortedForms = useMemo(() => {
    if (!forms) return [];

    let filtered = [...forms];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (form) =>
          form.name.toLowerCase().includes(search) ||
          form.email.toLowerCase().includes(search) ||
          form.phone.toLowerCase().includes(search) ||
          form.address.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return Number(b.timestamp - a.timestamp);
      } else if (sortBy === 'oldest') {
        return Number(a.timestamp - b.timestamp);
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return filtered;
  }, [forms, searchTerm, sortBy]);

  const handleRetry = async () => {
    await refetchHealth();
    await refetch();
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (healthStatus !== 'ok') {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="max-w-md w-full bg-card border rounded-lg p-6 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <h3 className="text-lg font-bold">Backend Unavailable</h3>
          <p className="text-sm text-muted-foreground">
            Unable to connect to the backend service. Please check your connection and try again.
          </p>
          <Button onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    const categorized = categorizeBackendError(error);

    if (categorized.category === 'unauthorized') {
      return <AccessDeniedScreen onLogout={handleLogout} />;
    }

    return (
      <div className="flex items-center justify-center py-16">
        <div className="max-w-md w-full bg-card border rounded-lg p-6 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <h3 className="text-lg font-bold">Error Loading Data</h3>
          <p className="text-sm text-muted-foreground">{categorized.message}</p>
          {categorized.canRetry && (
            <Button onClick={handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div>
          <h1 className="text-2xl font-bold mb-1">Customer Submissions</h1>
          <p className="text-muted-foreground">View and manage all customer form submissions</p>
        </div>
      )}

      <DashboardStats forms={forms || []} />

      <DashboardFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <DashboardTable forms={filteredAndSortedForms} />
    </div>
  );
}
