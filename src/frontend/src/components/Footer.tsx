import { Heart, Phone, Mail, MapPin } from 'lucide-react';
import { BRANDING } from '../constants/branding';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' 
    ? encodeURIComponent(window.location.hostname)
    : 'gb-insurance';

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={BRANDING.logo.main}
                alt={BRANDING.logo.alt}
                className="h-10 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <h3 className="text-xl font-bold">{BRANDING.company.name}</h3>
            </div>
            <p className="text-sm opacity-90 mb-4">
              {BRANDING.company.description}
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
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
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{BRANDING.contact.address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 pt-6 text-center text-sm">
          <p className="flex items-center justify-center gap-2 mb-2">
            © {currentYear} {BRANDING.company.name}. All rights reserved.
          </p>
          <p className="flex items-center justify-center gap-1 opacity-80">
            Built with <Heart className="h-4 w-4 text-red-400" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80 transition-opacity"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
