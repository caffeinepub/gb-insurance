import { useGetAppSettings } from '../hooks/useQueries';
import { Phone, Clock, Mail } from 'lucide-react';

export default function SupportSection() {
  const { data: appSettings } = useGetAppSettings();

  const contactEmail = appSettings?.contactEmail || 'info@iapl.com';
  const officeHours = appSettings?.officeHours || '9 AM - 5 PM, Monday to Friday';

  return (
    <section className="py-20 px-4 bg-gradient-light">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-card border-4 border-primary rounded-2xl p-12 shadow-primary animate-pulse-glow">
          <div className="text-center mb-12">
            <div className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm mb-4 shadow-primary">
              24/7 SUPPORT
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              We're Here to Help
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Our dedicated support team is available around the clock to assist you with any questions or concerns
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-background rounded-xl border-2 border-border hover-lift transition-smooth shadow-light hover-shadow-light">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-primary">
                <Phone className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Call Us</h3>
              <p className="text-muted-foreground font-medium mb-3">Available 24/7</p>
              <a
                href="tel:+1234567890"
                className="text-primary font-bold text-lg hover:text-primary/80 transition-colors"
              >
                +1 (234) 567-890
              </a>
            </div>

            <div className="text-center p-6 bg-background rounded-xl border-2 border-border hover-lift transition-smooth shadow-light hover-shadow-light">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-secondary">
                <Mail className="h-8 w-8 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Email Us</h3>
              <p className="text-muted-foreground font-medium mb-3">Quick response</p>
              <a
                href={`mailto:${contactEmail}`}
                className="text-primary font-bold text-lg hover:text-primary/80 transition-colors break-all"
              >
                {contactEmail}
              </a>
            </div>

            <div className="text-center p-6 bg-background rounded-xl border-2 border-border hover-lift transition-smooth shadow-light hover-shadow-light">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-primary">
                <Clock className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Office Hours</h3>
              <p className="text-muted-foreground font-medium mb-3">Visit us</p>
              <p className="text-foreground font-bold text-base">{officeHours}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
