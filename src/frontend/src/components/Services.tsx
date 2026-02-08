import { useGetSiteContent } from '../hooks/useQueries';
import { Shield, Heart, Car, Home, Plane, Activity } from 'lucide-react';

const defaultServices = [
  {
    icon: Heart,
    title: 'Life Insurance',
    description: 'Secure your family\'s future with comprehensive life insurance coverage.',
  },
  {
    icon: Activity,
    title: 'Health Insurance',
    description: 'Access quality healthcare with our flexible health insurance plans.',
  },
  {
    icon: Car,
    title: 'Vehicle Insurance',
    description: 'Protect your vehicle with our comprehensive auto insurance solutions.',
  },
  {
    icon: Home,
    title: 'Property Insurance',
    description: 'Safeguard your home and belongings with our property insurance.',
  },
  {
    icon: Plane,
    title: 'Travel Insurance',
    description: 'Travel with confidence knowing you\'re covered wherever you go.',
  },
  {
    icon: Shield,
    title: 'Personal Accident',
    description: 'Get financial protection against unexpected accidents and injuries.',
  },
];

export default function Services() {
  const { data: siteContent } = useGetSiteContent();

  const services = siteContent?.services && siteContent.services.length > 0
    ? siteContent.services.map((service, index) => ({
        icon: defaultServices[index % defaultServices.length].icon,
        title: service.title,
        description: service.description,
      }))
    : defaultServices;

  return (
    <section id="services" className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Insurance Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Comprehensive coverage options designed to protect you and your loved ones
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="bg-card border-2 border-border rounded-xl p-8 hover-lift shadow-light hover-shadow-light transition-smooth animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6 shadow-primary">
                  <Icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{service.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-gradient-accent rounded-2xl p-12 text-center shadow-primary animate-fade-in">
          <h3 className="text-3xl font-bold text-white mb-4">
            Need Help Choosing the Right Plan?
          </h3>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto font-medium">
            Our expert advisors are here to guide you through our insurance options and help you find the perfect coverage for your needs.
          </p>
          <a
            href="#contact"
            className="inline-block px-10 py-4 bg-white text-primary rounded-lg font-bold text-lg hover:bg-white/90 transition-smooth shadow-light hover-shadow-light"
          >
            Get Expert Advice
          </a>
        </div>
      </div>
    </section>
  );
}
