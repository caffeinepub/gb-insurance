import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllForms, useIsPrimaryAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useBackendHealth } from '../hooks/useBackendHealth';
import { useQueryClient } from '@tanstack/react-query';
import DashboardHeader from '../components/DashboardHeader';
import DashboardTable from '../components/DashboardTable';
import DashboardStats from '../components/DashboardStats';
import DashboardFilters from '../components/DashboardFilters';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import type { CustomerForm, InsuranceType } from '../backend';
import { Loader2, AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const navigate = useNavigate();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: forms = [], isLoading: formsLoading, error: formsError, refetch: refetchForms } = useGetAllForms();
  const { data: isPrimaryAdmin, isLoading: adminLoading, error: adminError, refetch: refetchAdminStatus } = useIsPrimaryAdmin();
  const { status: healthStatus, isChecking: healthChecking, refetch: refetchHealth } = useBackendHealth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<InsuranceType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [isManualRetrying, setIsManualRetrying] = useState(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const handleManualRefresh = async () => {
    setIsManualRetrying(true);
    try {
      await Promise.all([refetchForms(), refetchHealth()]);
    } finally {
      setIsManualRetrying(false);
    }
  };

  const handleErrorRetry = async () => {
    setIsManualRetrying(true);
    try {
      await Promise.all([refetchForms(), refetchAdminStatus(), refetchHealth()]);
    } finally {
      setIsManualRetrying(false);
    }
  };

  // Show access denied if not admin (only after loading completes)
  if (!adminLoading && isPrimaryAdmin === false && !adminError) {
    return <AccessDeniedScreen onLogout={handleLogout} />;
  }

  // Filter and sort forms
  let filteredForms = forms.filter((form: CustomerForm) => {
    const matchesSearch =
      form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.phone.includes(searchTerm);

    const matchesFilter =
      filterType === 'all' || form.insuranceInterests.some((interest) => interest === filterType);

    return matchesSearch && matchesFilter;
  });

  filteredForms = [...filteredForms].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return Number(b.timestamp - a.timestamp);
    }
  });

  // Determine error type and message
  const isBackendUnreachable = healthStatus === 'unreachable';
  const isUnauthorized = healthStatus === 'ok' && (formsError || adminError);

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <DashboardHeader onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 animate-slide-up flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Customer Submissions Dashboard</h1>
            <p className="text-muted-foreground font-medium">View and manage customer insurance inquiries</p>
          </div>
          <Button
            onClick={handleManualRefresh}
            variant="outline"
            disabled={isManualRetrying || formsLoading || healthChecking}
            className="border-2 border-border hover:border-primary transition-smooth"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isManualRetrying || healthChecking ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Backend unreachable error */}
        {isBackendUnreachable && (
          <Alert variant="destructive" className="mb-6 animate-fade-in border-2">
            <WifiOff className="h-5 w-5" />
            <AlertTitle className="font-bold">Backend Connection Failed</AlertTitle>
            <AlertDescription className="font-medium space-y-3">
              <p>
                Unable to connect to the backend. Please check your internet connection and ensure the backend
                canister is deployed and running.
              </p>
              <Button
                onClick={handleErrorRetry}
                variant="outline"
                size="sm"
                disabled={isManualRetrying}
                className="bg-background hover:bg-background/80 border-2 border-background text-destructive-foreground hover:text-destructive-foreground font-bold"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isManualRetrying ? 'animate-spin' : ''}`} />
                {isManualRetrying ? 'Retrying...' : 'Retry Connection'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Authorization error */}
        {isUnauthorized && (
          <Alert variant="destructive" className="mb-6 animate-fade-in border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-bold">Authorization Error</AlertTitle>
            <AlertDescription className="font-medium space-y-3">
              <p>
                You do not have permission to access this data. Admin privileges may be required. Please ensure you
                are logged in with an authorized admin account.
              </p>
              <Button
                onClick={handleErrorRetry}
                variant="outline"
                size="sm"
                disabled={isManualRetrying}
                className="bg-background hover:bg-background/80 border-2 border-background text-destructive-foreground hover:text-destructive-foreground font-bold"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isManualRetrying ? 'animate-spin' : ''}`} />
                {isManualRetrying ? 'Retrying...' : 'Retry Authorization'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Generic error (not backend unreachable or unauthorized) */}
        {formsError && !isBackendUnreachable && !isUnauthorized && (
          <Alert variant="destructive" className="mb-6 animate-fade-in border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-bold">Error Loading Customer Submissions</AlertTitle>
            <AlertDescription className="font-medium space-y-3">
              <p>An unexpected error occurred while loading customer data. Please try again.</p>
              <Button
                onClick={handleErrorRetry}
                variant="outline"
                size="sm"
                disabled={isManualRetrying}
                className="bg-background hover:bg-background/80 border-2 border-background text-destructive-foreground hover:text-destructive-foreground font-bold"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isManualRetrying ? 'animate-spin' : ''}`} />
                {isManualRetrying ? 'Retrying...' : 'Retry Loading Data'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <DashboardStats forms={forms} />
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <DashboardFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterType={filterType}
            onFilterChange={setFilterType}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {formsLoading || adminLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <DashboardTable forms={filteredForms} />
          </div>
        )}
      </main>
    </div>
  );
}
