import { useState } from 'react';
import { useGetAppSettings } from '../hooks/useQueries';
import { Menu, X, Phone, Mail } from 'lucide-react';
import { BRANDING } from '../constants/branding';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: appSettings } = useGetAppSettings();

  const maintenanceMode = appSettings?.maintenanceMode || false;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {maintenanceMode && (
        <Alert className="rounded-none border-x-0 border-t-0 border-b-2 border-warning bg-warning/10">
          <AlertCircle className="h-5 w-5 text-warning" />
          <AlertDescription className="text-warning font-semibold">
            The site is currently in maintenance mode. Some features may be unavailable.
          </AlertDescription>
        </Alert>
      )}
      <header className="bg-card border-b-2 border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={BRANDING.logo.main}
                alt={BRANDING.logo.alt}
                className="h-12 w-auto logo-enhanced"
                onError={(e) => {
                  console.error('Logo failed to load');
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">{BRANDING.company.name}</h1>
                <p className="text-xs text-muted-foreground font-medium">{BRANDING.company.tagline}</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('dashboard')}
                className="text-foreground hover:text-primary font-semibold transition-colors"
              >
                dashboard
              </button>
              <a href="#services" className="text-foreground hover:text-primary font-semibold transition-colors">
                Services
              </a>
              <a href="#contact" className="text-foreground hover:text-primary font-semibold transition-colors">
                Contact
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-smooth shadow-primary"
              >
                <Phone className="h-4 w-4" />
                Call Now
              </a>
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pt-4 border-t-2 border-border space-y-4 animate-slide-up">
              <button
                onClick={() => scrollToSection('dashboard')}
                className="block w-full text-left text-foreground hover:text-primary font-semibold transition-colors"
              >
                dashboard
              </button>
              <a
                href="#services"
                className="block text-foreground hover:text-primary font-semibold transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </a>
              <a
                href="#contact"
                className="block text-foreground hover:text-primary font-semibold transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-smooth shadow-primary"
              >
                <Phone className="h-4 w-4" />
                Call Now
              </a>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
