import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, ChevronDown, Shield, FileText } from 'lucide-react';
import { BRANDING } from '../constants/branding';

export default function DashboardHeader() {
  const navigate = useNavigate();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const handleNavigateToSubmissions = () => {
    navigate({ to: '/dashboard' });
  };

  const handleNavigateToAdminManagement = () => {
    navigate({ to: '/dashboard/admins' });
  };

  const principalId = identity?.getPrincipal().toString() || 'Unknown';
  const shortPrincipal = principalId.length > 20 
    ? `${principalId.slice(0, 8)}...${principalId.slice(-8)}`
    : principalId;

  return (
    <header className="bg-card border-b shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={BRANDING.logo.main}
              alt={BRANDING.logo.alt}
              className="h-10 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-lg font-bold">Admin Area</h1>
              <p className="text-sm text-muted-foreground">{BRANDING.company.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Navigation Buttons */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNavigateToSubmissions}
              className="hidden sm:flex"
            >
              <FileText className="h-4 w-4 mr-2" />
              Submissions
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNavigateToAdminManagement}
              className="hidden sm:flex"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin Management
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium">Admin</p>
                    <p className="text-xs text-muted-foreground">{shortPrincipal}</p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleNavigateToSubmissions} className="cursor-pointer sm:hidden">
                  <FileText className="h-4 w-4 mr-2" />
                  Submissions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleNavigateToAdminManagement} className="cursor-pointer sm:hidden">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Management
                </DropdownMenuItem>
                <DropdownMenuSeparator className="sm:hidden" />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
