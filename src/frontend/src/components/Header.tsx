import { Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { BRANDING } from '@/constants/branding';

export default function Header() {
  const navigate = useNavigate();
  const [logoError, setLogoError] = useState(false);

  const handleAdminLogin = () => {
    navigate({ to: '/admin-login' });
  };

  const handleLogoError = () => {
    setLogoError(true);
    console.warn('GB Insurance logo failed to load, using fallback');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-background shadow-primary backdrop-blur-sm">
      <div className="container mx-auto px-4 py-5 md:py-7 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-4 md:gap-6 transition-smooth hover:scale-105 cursor-pointer">
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
              {BRANDING.company.name}
              <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-secondary animate-pulse" />
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-semibold">{BRANDING.company.tagline}</p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          <a href="#home" className="text-sm font-bold text-foreground hover:text-primary transition-smooth-fast relative group py-2">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-1 bg-secondary transition-all duration-300 group-hover:w-full rounded-full"></span>
          </a>
          <a href="#services" className="text-sm font-bold text-foreground hover:text-primary transition-smooth-fast relative group py-2">
            Services
            <span className="absolute -bottom-1 left-0 w-0 h-1 bg-secondary transition-all duration-300 group-hover:w-full rounded-full"></span>
          </a>
          <a href="#contact" className="text-sm font-bold text-foreground hover:text-primary transition-smooth-fast relative group py-2">
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-1 bg-secondary transition-all duration-300 group-hover:w-full rounded-full"></span>
          </a>
        </nav>

        <Button
          onClick={handleAdminLogin}
          className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 transition-smooth shadow-primary hover-shadow-primary font-bold border-2 border-primary h-12 px-4 md:px-6 text-sm md:text-base"
        >
          <Shield className="mr-2 h-4 w-4 md:h-5 md:w-5" />
          <span className="hidden sm:inline">Admin Login</span>
          <span className="sm:hidden">Admin</span>
        </Button>
      </div>
    </header>
  );
}
