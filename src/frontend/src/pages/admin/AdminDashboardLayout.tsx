import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { useIsPrimaryAdmin } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import AccessDeniedScreen from '../../components/AccessDeniedScreen';
import DashboardHeader from '../../components/DashboardHeader';
import { Loader2, LayoutDashboard, Users, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { identity, isInitializing, clear } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsPrimaryAdmin();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  if (isInitializing || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-foreground font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <AccessDeniedScreen onLogout={handleLogout} />;
  }

  const navItems = [
    { path: '/dashboard', label: 'Submissions', icon: LayoutDashboard },
    { path: '/dashboard/users', label: 'Users', icon: Users },
    { path: '/dashboard/content', label: 'Content', icon: FileText },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      
      {/* Navigation Tabs */}
      <div className="border-b-2 border-border bg-card">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Button
                  key={item.path}
                  onClick={() => navigate({ to: item.path })}
                  variant="ghost"
                  className={`flex items-center gap-2 px-6 py-3 rounded-none border-b-2 transition-colors ${
                    active
                      ? 'border-primary text-primary font-semibold bg-primary/5'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
