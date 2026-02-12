import { Phone, Mail, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function SupportSection() {
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Need Help? We're Here for You
          </h2>
          <p className="text-lg text-muted-foreground">
            Our team is ready to assist you with any questions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 bg-card">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Call Us</h3>
              <a
                href="tel:+1234567890"
                className="text-primary hover:underline font-medium"
              >
                (123) 456-7890
              </a>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 bg-card">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Email Us</h3>
              <a
                href="mailto:info@gbinsurance.com"
                className="text-primary hover:underline font-medium"
              >
                info@gbinsurance.com
              </a>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 bg-card">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Office Hours</h3>
              <p className="text-foreground font-medium">Mon-Fri: 9AM-5PM</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
