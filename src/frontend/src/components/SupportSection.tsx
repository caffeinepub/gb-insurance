import { Clock, Phone, MessageCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SupportSection() {
  return (
    <section className="py-20 bg-gradient-light relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(0.55_0.15_240_/_0.08),transparent_60%)]"></div>
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-4 font-bold border-2 border-secondary/20">
            <Clock className="h-5 w-5" />
            <span>24/7 Support Available</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            We're Here to Help
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our dedicated support team is always ready to assist you with any questions or concerns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-card border-2 border-border rounded-xl p-8 hover-lift hover-shadow-secondary transition-smooth group animate-scale-in">
            <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-smooth animate-pulse-glow">
              <Phone className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Phone Support</h3>
            <p className="text-muted-foreground mb-4">
              Call us anytime for immediate assistance with your insurance needs.
            </p>
            <p className="text-secondary font-bold text-lg">1800-123-4567</p>
          </div>

          <div className="bg-card border-2 border-border rounded-xl p-8 hover-lift hover-shadow-primary transition-smooth group animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-smooth animate-pulse-glow">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Live Chat</h3>
            <p className="text-muted-foreground mb-4">
              Chat with our support team in real-time for quick solutions.
            </p>
            <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold">
              Start Chat
            </Button>
          </div>

          <div className="bg-card border-2 border-border rounded-xl p-8 hover-lift hover-shadow-accent transition-smooth group animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-smooth animate-pulse-glow">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Quick Response</h3>
            <p className="text-muted-foreground mb-4">
              Average response time of under 2 minutes for all inquiries.
            </p>
            <p className="text-accent font-bold text-lg">&lt; 2 min</p>
          </div>
        </div>

        <div className="bg-card border-2 border-secondary rounded-xl p-10 text-center shadow-secondary animate-fade-in">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Need Help? We're Just a Call Away!
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our expert team is available 24/7 to answer your questions and provide personalized insurance guidance.
          </p>
          <Button
            size="lg"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-lg px-8 py-6 h-auto shadow-secondary hover-shadow-secondary"
          >
            <Phone className="mr-2 h-5 w-5" />
            Contact Support Now
          </Button>
        </div>
      </div>
    </section>
  );
}
