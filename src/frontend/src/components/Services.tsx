import { Heart, Activity, Car, Home, Plane, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Services() {
  const services = [
    {
      icon: Heart,
      title: 'Life Insurance',
      description: 'Secure your family\'s future with comprehensive life coverage plans.',
      features: ['Term Insurance', 'Whole Life Plans', 'Child Plans', 'Pension Plans'],
      color: 'primary',
    },
    {
      icon: Activity,
      title: 'Health Insurance',
      description: 'Complete medical coverage for you and your loved ones.',
      features: ['Individual Plans', 'Family Floater', 'Critical Illness', 'Senior Citizen'],
      color: 'secondary',
    },
    {
      icon: Car,
      title: 'Vehicle Insurance',
      description: 'Protect your vehicle with comprehensive motor insurance.',
      features: ['Car Insurance', 'Two Wheeler', 'Commercial Vehicle', 'Third Party'],
      color: 'accent',
    },
    {
      icon: Home,
      title: 'Property Insurance',
      description: 'Safeguard your home and belongings against unforeseen events.',
      features: ['Home Insurance', 'Fire Coverage', 'Theft Protection', 'Natural Disasters'],
      color: 'primary',
    },
    {
      icon: Plane,
      title: 'Travel Insurance',
      description: 'Travel worry-free with comprehensive travel protection.',
      features: ['Domestic Travel', 'International', 'Student Travel', 'Medical Coverage'],
      color: 'secondary',
    },
    {
      icon: Shield,
      title: 'Personal Accident',
      description: 'Financial protection against accidental injuries and disabilities.',
      features: ['Accidental Death', 'Disability Cover', 'Medical Expenses', 'Family Protection'],
      color: 'accent',
    },
  ];

  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Our Insurance Services</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive insurance solutions designed to protect what matters most to you and your family.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const Icon = service.icon;
            const colorClass = service.color === 'primary' ? 'text-primary bg-primary/10 group-hover:bg-primary/20' :
                              service.color === 'secondary' ? 'text-secondary bg-secondary/10 group-hover:bg-secondary/20' :
                              'text-accent bg-accent/10 group-hover:bg-accent/20';
            const shadowClass = service.color === 'primary' ? 'hover-shadow-primary' :
                               service.color === 'secondary' ? 'hover-shadow-secondary' :
                               'hover-shadow-accent';
            
            return (
              <div
                key={index}
                className={`bg-card border-2 border-border rounded-xl p-8 hover-lift ${shadowClass} transition-smooth group animate-scale-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-smooth ${colorClass}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-muted-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full mr-3 ${service.color === 'primary' ? 'bg-primary' : service.color === 'secondary' ? 'bg-secondary' : 'bg-accent'}`}></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-primary text-primary-foreground rounded-2xl p-12 text-center shadow-primary animate-fade-in">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Protected?</h3>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Get in touch with us today and let our experts help you find the perfect insurance plan for your needs.
          </p>
          <Button
            size="lg"
            className="bg-background text-primary hover:bg-background/90 font-bold text-lg px-8 py-6 h-auto shadow-light hover-shadow-light"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </section>
  );
}
