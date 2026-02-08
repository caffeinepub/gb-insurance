import { useState, useMemo } from 'react';
import { useGetAllForms } from '../hooks/useQueries';
import { useBackendHealth } from '../hooks/useBackendHealth';
import DashboardStats from './DashboardStats';
import DashboardFilters from './DashboardFilters';
import DashboardTable from './DashboardTable';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import type { InsuranceType } from '../backend';

interface SubmissionsDashboardProps {
  showTitle?: boolean;
}

export default function SubmissionsDashboard({ showTitle = true }: SubmissionsDashboardProps) {
  const { data: forms, isLoading, error, refetch } = useGetAllForms();
  const { status: healthStatus, refetch: refetchHealth } = useBackendHealth();

  const [searchQuery, setSearchQuery] = useState('');
  const [insuranceFilter, setInsuranceFilter] = useState<InsuranceType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');

  const filteredAndSortedForms = useMemo(() => {
    if (!forms) return [];

    let filtered = forms.filter((form) => {
      const matchesSearch =
        form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.phone.includes(searchQuery);

      const matchesInsurance =
        insuranceFilter === 'all' || form.insuranceInterests.includes(insuranceFilter);

      return matchesSearch && matchesInsurance;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'date') return Number(b.timestamp - a.timestamp);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return filtered;
  }, [forms, searchQuery, insuranceFilter, sortBy]);

  const isBackendUnreachable = healthStatus === 'unreachable';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-foreground font-medium">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (isBackendUnreachable) {
    return (
      <div className="space-y-6">
        <Alert className="border-2 border-destructive bg-destructive/10">
          <WifiOff className="h-5 w-5 text-destructive" />
          <AlertDescription className="text-destructive font-semibold">
            <div className="flex items-center justify-between">
              <span>Backend is unreachable. Please check your connection.</span>
              <Button
                onClick={() => {
                  refetchHealth();
                  refetch();
                }}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert className="border-2 border-destructive bg-destructive/10">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <AlertDescription className="text-destructive font-semibold">
            <div className="flex items-center justify-between">
              <span>Failed to load submissions. {error.message}</span>
              <Button onClick={() => refetch()} variant="outline" size="sm" className="ml-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {showTitle && (
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Customer Submissions</h1>
          <p className="text-muted-foreground">
            Manage and review all customer form submissions
          </p>
        </div>
      )}

      <DashboardStats forms={forms || []} />

      <DashboardFilters
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={insuranceFilter}
        onFilterChange={setInsuranceFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <DashboardTable forms={filteredAndSortedForms} />
    </div>
  );
}
