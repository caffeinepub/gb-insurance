import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Shield, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { BRANDING } from '@/constants/branding';

interface DashboardHeaderProps {
  onLogout: () => void;
}

export default function DashboardHeader({ onLogout }: DashboardHeaderProps) {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const [logoError, setLogoError] = useState(false);

  const handleLogoError = () => {
    setLogoError(true);
    console.warn('GB Insurance logo failed to load in dashboard header, using fallback');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-background shadow-primary">
      <div className="container mx-auto px-4 py-5 md:py-7 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-4 md:gap-6 transition-smooth hover:scale-105">
            <div className="relative flex-shrink-0 h-[70px] w-[70px] sm:h-[90px] sm:w-[90px] md:h-[110px] md:w-[110px]">
              {!logoError ? (
                <img 
                  src={BRANDING.logo.main}
                  alt={BRANDING.logo.alt}
                  className="relative h-full w-full object-contain logo-enhanced"
                  loading="eager"
                  onError={handleLogoError}
                />
              ) : (
                <div className="relative h-full w-full bg-primary rounded-full flex items-center justify-center border-2 border-primary">
                  <Shield className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-primary-foreground" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-1 md:gap-2">
                Admin Dashboard
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-secondary animate-pulse" />
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-semibold">{BRANDING.company.name}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {isLoading ? (
            <div className="hidden md:flex items-center gap-3 px-4 md:px-5 py-2 md:py-3 bg-muted rounded-lg border-2 border-border animate-pulse">
              <div className="h-5 w-5 bg-primary rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-primary rounded"></div>
                <div className="h-3 w-16 bg-primary rounded"></div>
              </div>
            </div>
          ) : userProfile ? (
            <div className="hidden md:flex items-center gap-3 px-4 md:px-5 py-2 md:py-3 bg-muted rounded-lg border-2 border-border">
              <User className="h-5 w-5 text-foreground" />
              <div>
                <p className="text-sm font-bold text-foreground">{userProfile.name}</p>
                <Badge className="bg-primary text-primary-foreground border-2 border-primary font-bold text-xs mt-1">
                  <Shield className="h-3 w-3 mr-1" />
                  {userProfile.role}
                </Badge>
              </div>
            </div>
          ) : null}
          <Button
            onClick={onLogout}
            variant="outline"
            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive border-2 border-border transition-smooth font-bold h-10 md:h-12 px-4 md:px-6 text-sm md:text-base text-foreground"
          >
            <LogOut className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
