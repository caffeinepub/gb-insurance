import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-primary to-secondary text-primary-foreground py-20 md:py-32">
      <div className="absolute inset-0 opacity-10">
        <img
          src="/assets/generated/gb-hero-banner.dim_1600x900.png"
          alt="Hero background"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Protecting What Matters Most to You
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Comprehensive insurance solutions tailored to your needs. Get peace of mind with GB Insurance.
          </p>
          <Button
            onClick={scrollToContact}
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6"
          >
            Get Your Free Quote
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
