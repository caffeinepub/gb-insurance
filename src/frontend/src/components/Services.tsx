import { Shield, Heart, Car, Home, Plane, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const defaultServices = [
  {
    title: 'Life Insurance',
    description: 'Secure your family\'s future with comprehensive life insurance coverage.',
    icon: Heart,
  },
  {
    title: 'Health Insurance',
    description: 'Quality healthcare coverage for you and your loved ones.',
    icon: Activity,
  },
  {
    title: 'Vehicle Insurance',
    description: 'Protect your vehicle with our comprehensive auto insurance plans.',
    icon: Car,
  },
  {
    title: 'Property Insurance',
    description: 'Safeguard your home and property with our reliable coverage.',
    icon: Home,
  },
  {
    title: 'Travel Insurance',
    description: 'Travel with confidence knowing you\'re covered wherever you go.',
    icon: Plane,
  },
  {
    title: 'Personal Accident',
    description: 'Financial protection against unexpected accidents and injuries.',
    icon: Shield,
  },
];

export default function Services() {
  return (
    <section id="services" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Insurance Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive coverage options designed to protect what matters most to you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {defaultServices.map((service) => {
            const Icon = service.icon;
            return (
              <Card
                key={service.title}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
