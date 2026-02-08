import { useGetAppSettings } from '../hooks/useQueries';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';
import { BRANDING } from '../constants/branding';

export default function Footer() {
  const { data: appSettings } = useGetAppSettings();

  const contactEmail = appSettings?.contactEmail || 'info@iapl.com';
  const officeHours = appSettings?.officeHours || '9 AM - 5 PM, Monday to Friday';

  return (
    <footer className="bg-gradient-light border-t-2 border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-12 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
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
                <h3 className="text-lg font-bold text-foreground">{BRANDING.company.name}</h3>
                <p className="text-xs text-muted-foreground font-medium">{BRANDING.company.tagline}</p>
              </div>
            </div>
            <p className="text-muted-foreground font-medium">
              Your trusted partner for comprehensive insurance solutions. Protecting what matters most since 2009.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold text-foreground mb-4">Contact Us</h4>
            <div className="space-y-3">
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                <Mail className="h-5 w-5" />
                {contactEmail}
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                <Phone className="h-5 w-5" />
                +1 (234) 567-890
              </a>
              <div className="flex items-start gap-3 text-muted-foreground font-medium">
                <MapPin className="h-5 w-5 mt-1" />
                <span>123 Insurance Street<br />Business District, City 12345</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-foreground mb-4">Office Hours</h4>
            <p className="text-muted-foreground font-medium mb-4">{officeHours}</p>
            <p className="text-sm text-muted-foreground font-medium">
              Emergency support available 24/7
            </p>
          </div>
        </div>

        <div className="border-t-2 border-border pt-8 text-center">
          <p className="text-muted-foreground font-medium">
            © 2026. Built with <Heart className="inline h-4 w-4 text-destructive" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 font-bold transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
