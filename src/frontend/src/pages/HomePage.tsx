import Header from '../components/Header';
import Hero from '../components/Hero';
import SupportSection from '../components/SupportSection';
import Services from '../components/Services';
import CustomerForm from '../components/CustomerForm';
import PublicSubmissionsDashboardSection from '../components/PublicSubmissionsDashboardSection';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen animate-fade-in">
      <Header />
      <main>
        <Hero />
        <SupportSection />
        <Services />
        <PublicSubmissionsDashboardSection />
        <CustomerForm />
      </main>
      <Footer />
    </div>
  );
}
