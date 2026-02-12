import { Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsPrimaryAdmin } from '../../hooks/useQueries';
import DashboardHeader from '../../components/DashboardHeader';
import AccessDeniedScreen from '../../components/AccessDeniedScreen';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminDashboardLayout() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading, isFetched } = useIsPrimaryAdmin();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const handleLogout = async () => {
    queryClient.clear();
    navigate({ to: '/' });
  };

  // Redirect to login if not authenticated
  if (!isInitializing && !isAuthenticated) {
    navigate({ to: '/admin-login' });
    return null;
  }

  // Show loading while checking authentication or admin status
  if (isInitializing || adminLoading || !isFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if authenticated but not admin
  if (isAuthenticated && !isAdmin) {
    return <AccessDeniedScreen onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
