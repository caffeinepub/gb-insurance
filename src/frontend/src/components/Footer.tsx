import { Heart, Phone, Mail, MapPin, Shield } from 'lucide-react';
import { useState } from 'react';
import { BRANDING } from '@/constants/branding';

export default function Footer() {
  const [logoError, setLogoError] = useState(false);

  const handleLogoError = () => {
    setLogoError(true);
    console.warn('GB Insurance logo failed to load in footer, using fallback');
  };

  return (
    <footer className="bg-gradient-light text-foreground border-t-2 border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,oklch(0.55_0.15_240_/_0.08),transparent_60%)]"></div>
      
      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="animate-fade-in">
            <div className="flex items-center gap-4 mb-6 transition-smooth hover:scale-105">
              <div className="relative flex-shrink-0 h-[60px] w-[60px] sm:h-[70px] sm:w-[70px] md:h-[80px] md:w-[80px]">
                {!logoError ? (
                  <img 
                    src={BRANDING.logo.main}
                    alt={BRANDING.logo.alt}
                    className="relative h-full w-full object-contain logo-enhanced"
                    loading="lazy"
                    onError={handleLogoError}
                  />
                ) : (
                  <div className="relative h-full w-full bg-primary rounded-full flex items-center justify-center border-2 border-primary">
                    <Shield className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary-foreground" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg md:text-xl">{BRANDING.company.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground font-semibold">{BRANDING.company.tagline}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {BRANDING.company.description}
            </p>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h4 className="font-bold text-foreground mb-4 text-base">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#home" className="hover:text-primary transition-smooth-fast hover:translate-x-1 inline-block font-medium">Home</a></li>
              <li><a href="#services" className="hover:text-primary transition-smooth-fast hover:translate-x-1 inline-block font-medium">Services</a></li>
              <li><a href="#contact" className="hover:text-primary transition-smooth-fast hover:translate-x-1 inline-block font-medium">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth-fast hover:translate-x-1 inline-block font-medium">About Us</a></li>
            </ul>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h4 className="font-bold text-foreground mb-4 text-base">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="transition-smooth-fast hover:text-primary hover:translate-x-1 font-medium">Life Insurance</li>
              <li className="transition-smooth-fast hover:text-primary hover:translate-x-1 font-medium">Health Insurance</li>
              <li className="transition-smooth-fast hover:text-primary hover:translate-x-1 font-medium">Vehicle Insurance</li>
              <li className="transition-smooth-fast hover:text-primary hover:translate-x-1 font-medium">Property Insurance</li>
            </ul>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h4 className="font-bold text-foreground mb-4 text-base">Contact Us</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2 transition-smooth hover:text-primary hover:translate-x-1 font-medium">
                <Phone className="h-4 w-4 text-secondary" />
                <span>{BRANDING.contact.phone}</span>
              </li>
              <li className="flex items-center gap-2 transition-smooth hover:text-primary hover:translate-x-1 font-medium">
                <Mail className="h-4 w-4 text-secondary" />
                <span>{BRANDING.contact.email}</span>
              </li>
              <li className="flex items-start gap-2 transition-smooth hover:text-primary hover:translate-x-1 font-medium">
                <MapPin className="h-4 w-4 text-secondary mt-0.5" />
                <span>{BRANDING.contact.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-border mt-8 pt-8 text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="flex items-center justify-center gap-1 flex-wrap font-medium">
            © 2026. Built with <Heart className="h-4 w-4 text-secondary inline animate-bounce-subtle" /> using{' '}
            <a 
              href="https://caffeine.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-secondary hover:underline transition-smooth-fast hover:scale-105 inline-block font-bold"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
