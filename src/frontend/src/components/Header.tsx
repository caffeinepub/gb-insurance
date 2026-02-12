import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Menu, X, Phone, Mail } from 'lucide-react';
import { BRANDING } from '../constants/branding';

export default function Header() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const handleAdminLogin = () => {
    navigate({ to: '/admin-login' });
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => navigate({ to: '/' })}
          >
            <img
              src={BRANDING.logo.main}
              alt={BRANDING.logo.alt}
              className="h-10 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-xl font-bold">{BRANDING.company.name}</h1>
              <p className="text-xs opacity-90">{BRANDING.company.tagline}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('services')}
              className="hover:opacity-80 transition-opacity font-medium"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="hover:opacity-80 transition-opacity font-medium"
            >
              Contact
            </button>
            <button
              onClick={handleAdminLogin}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity font-medium"
            >
              Admin Login
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-2 border-t border-primary-foreground/20">
            <button
              onClick={() => scrollToSection('services')}
              className="block w-full text-left px-4 py-2 hover:bg-primary-foreground/10 rounded transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left px-4 py-2 hover:bg-primary-foreground/10 rounded transition-colors"
            >
              Contact
            </button>
            <button
              onClick={handleAdminLogin}
              className="block w-full text-left px-4 py-2 bg-secondary text-secondary-foreground rounded hover:opacity-90 transition-opacity"
            >
              Admin Login
            </button>
          </nav>
        )}
      </div>

      {/* Contact Bar */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 text-sm">
            <a
              href={`tel:${BRANDING.contact.phone}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Phone className="h-4 w-4" />
              <span>{BRANDING.contact.phone}</span>
            </a>
            <a
              href={`mailto:${BRANDING.contact.email}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Mail className="h-4 w-4" />
              <span>{BRANDING.contact.email}</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
