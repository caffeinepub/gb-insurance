import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllForms, useIsPrimaryAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import DashboardHeader from '../components/DashboardHeader';
import DashboardTable from '../components/DashboardTable';
import DashboardStats from '../components/DashboardStats';
import DashboardFilters from '../components/DashboardFilters';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import type { CustomerForm, InsuranceType } from '../backend';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getSessionParameter } from '../utils/urlParams';

export default function Dashboard() {
  const navigate = useNavigate();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: forms = [], isLoading: formsLoading, error: formsError, refetch: refetchForms } = useGetAllForms();
  const { data: isPrimaryAdmin, isLoading: adminLoading, refetch: refetchAdminStatus } = useIsPrimaryAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<InsuranceType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isManualRetrying, setIsManualRetrying] = useState(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  // Fallback retry: if forms fail to load and admin status is uncertain, retry
  useEffect(() => {
    if (formsError && isPrimaryAdmin === false && retryAttempt < 2) {
      const timer = setTimeout(() => {
        setRetryAttempt(prev => prev + 1);
        refetchAdminStatus();
        refetchForms();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formsError, isPrimaryAdmin, retryAttempt, refetchAdminStatus, refetchForms]);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const handleManualRefresh = async () => {
    setIsManualRetrying(true);
    setRetryAttempt(0);
    try {
      await refetchForms();
    } finally {
      setIsManualRetrying(false);
    }
  };

  const handleErrorRetry = async () => {
    setIsManualRetrying(true);
    setRetryAttempt(0);
    try {
      await Promise.all([refetchForms(), refetchAdminStatus()]);
    } finally {
      setIsManualRetrying(false);
    }
  };

  // Show access denied if not admin
  if (!adminLoading && isPrimaryAdmin === false) {
    return <AccessDeniedScreen onLogout={handleLogout} />;
  }

  // Filter and sort forms
  let filteredForms = forms.filter((form: CustomerForm) => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.phone.includes(searchTerm);
    
    const matchesFilter = filterType === 'all' || 
                         form.insuranceInterests.some(interest => interest === filterType);
    
    return matchesSearch && matchesFilter;
  });

  // Sort forms
  filteredForms = [...filteredForms].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return Number(b.timestamp - a.timestamp);
    }
  });

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
            disabled={isManualRetrying || formsLoading}
            className="border-2 border-border hover:border-primary transition-smooth"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isManualRetrying ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

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

        {formsError && (
          <Alert variant="destructive" className="mb-6 animate-fade-in border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-bold">Error Loading Customer Submissions</AlertTitle>
            <AlertDescription className="font-medium space-y-3">
              <p>
                {retryAttempt < 2 
                  ? 'Attempting to reconnect and load customer data...' 
                  : 'Unable to load customer submissions. This may be due to a connection issue or authorization problem.'}
              </p>
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

        {formsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <DashboardTable
              forms={filteredForms}
            />
          </div>
        )}
      </main>
    </div>
  );
}
