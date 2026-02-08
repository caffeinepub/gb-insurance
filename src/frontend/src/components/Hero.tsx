import { useGetSiteContent } from '../hooks/useQueries';
import { Loader2 } from 'lucide-react';

export default function Hero() {
  const { data: siteContent, isLoading } = useGetSiteContent();

  const heroText = siteContent?.heroText || 'Your peace of mind is our priority.';
  const heroImageUrl = siteContent?.heroImage?.getDirectURL();
  const fallbackImageUrl = '/assets/generated/gb-hero-banner.dim_1600x900.png';

  return (
    <section className="relative bg-gradient-light py-20 px-4 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-slide-up">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  Loading...
                </span>
              ) : (
                heroText
              )}
            </h1>
            <p className="text-xl text-muted-foreground font-medium">
              Comprehensive insurance solutions tailored to protect what matters most to you and your family.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="#contact"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:bg-primary/90 transition-smooth shadow-primary hover-shadow-primary"
              >
                Get Started
              </a>
              <a
                href="#services"
                className="px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-bold text-lg hover:bg-secondary/90 transition-smooth shadow-secondary hover-shadow-secondary"
              >
                Our Services
              </a>
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="relative rounded-2xl overflow-hidden border-4 border-primary shadow-primary hover-shadow-primary transition-smooth hover-lift">
              <img
                src={heroImageUrl || fallbackImageUrl}
                alt="GB Insurance Hero"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  if (e.currentTarget.src !== fallbackImageUrl) {
                    e.currentTarget.src = fallbackImageUrl;
                  }
                }}
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary rounded-full opacity-20 blur-3xl"></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-fade-in">
          {[
            { label: 'Years Experience', value: '15+' },
            { label: 'Happy Clients', value: '5000+' },
            { label: 'Insurance Plans', value: '50+' },
            { label: 'Claims Processed', value: '10K+' },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-card border-2 border-border rounded-xl p-6 text-center hover-lift shadow-light hover-shadow-light transition-smooth"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
