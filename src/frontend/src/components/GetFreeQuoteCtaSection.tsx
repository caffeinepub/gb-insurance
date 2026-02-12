import { Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function GetFreeQuoteCtaSection() {
  const scrollToForm = () => {
    const formElement = document.getElementById('contact');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-accent relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,oklch(0.85_0.15_85_/_0.15),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,oklch(0.75_0.12_220_/_0.1),transparent_60%)]"></div>
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <Card className="border-4 border-white/20 shadow-2xl bg-white/95 backdrop-blur-sm hover-lift transition-smooth animate-scale-in">
          <CardContent className="p-12 md:p-16 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-6 shadow-gold animate-pulse-subtle">
              <Sparkles className="h-5 w-5" />
              <span>Limited Time Offer</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in">
              Get Your Free Quote
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto font-medium leading-relaxed animate-slide-up">
              Take the first step towards comprehensive insurance coverage. Our expert team will provide you with a personalized quote tailored to your unique needs—absolutely free, with no obligation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>24-Hour Response</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Expert Guidance</span>
              </div>
            </div>
            
            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-smooth shadow-gold hover-shadow-gold hover-lift group"
            >
              <span>Start Your Free Quote</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-sm text-muted-foreground mt-6 font-medium animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Join thousands of satisfied customers who trust us with their insurance needs
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
