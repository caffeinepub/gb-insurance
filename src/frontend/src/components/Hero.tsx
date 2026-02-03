import { Shield, Users, Award, TrendingUp, Share2 } from 'lucide-react';
import { useState } from 'react';

export default function Hero() {
  const [imageError, setImageError] = useState(false);

  return (
    <section id="home" className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-light">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,oklch(0.55_0.15_240_/_0.12),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,oklch(0.65_0.15_50_/_0.08),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 py-20 max-w-7xl relative z-10">
        {/* Banner Image */}
        {!imageError && (
          <div className="mb-12 animate-fade-in">
            <img 
              src="/assets/generated/gb-hero-banner.dim_1600x900.png"
              alt="GB Insurance - Comprehensive vehicle insurance coverage for cars, motorcycles, and commercial vehicles"
              className="w-full max-w-5xl mx-auto rounded-2xl shadow-2xl border-4 border-primary/20 hover:border-primary/40 transition-all duration-300"
              onError={() => setImageError(true)}
              loading="eager"
            />
          </div>
        )}

        {/* Shareable Preview Link */}
        <div className="mb-8 text-center animate-fade-in">
          <a
            href="/assets/generated/gb-hero-share-preview.dim_1200x630.png"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Share2 className="h-5 w-5" />
            Open shareable preview image
          </a>
        </div>

        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Your Trusted Insurance Partner
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Comprehensive insurance solutions tailored for Indian families. 
            Protecting what matters most with reliable coverage and exceptional service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          <div className="bg-card border-2 border-border rounded-xl p-6 hover-lift hover-shadow-secondary transition-smooth group">
            <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-smooth">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-2">50K+</h3>
            <p className="text-sm text-muted-foreground font-medium">Policies Issued</p>
          </div>

          <div className="bg-card border-2 border-border rounded-xl p-6 hover-lift hover-shadow-secondary transition-smooth group">
            <div className="bg-secondary/10 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-smooth">
              <Users className="h-7 w-7 text-secondary" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-2">45K+</h3>
            <p className="text-sm text-muted-foreground font-medium">Happy Customers</p>
          </div>

          <div className="bg-card border-2 border-border rounded-xl p-6 hover-lift hover-shadow-accent transition-smooth group">
            <div className="bg-accent/10 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-smooth">
              <Award className="h-7 w-7 text-accent" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-2">15+</h3>
            <p className="text-sm text-muted-foreground font-medium">Years Experience</p>
          </div>

          <div className="bg-card border-2 border-border rounded-xl p-6 hover-lift hover-shadow-primary transition-smooth group">
            <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-smooth">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-2">98%</h3>
            <p className="text-sm text-muted-foreground font-medium">Claim Settlement</p>
          </div>
        </div>
      </div>
    </section>
  );
}
