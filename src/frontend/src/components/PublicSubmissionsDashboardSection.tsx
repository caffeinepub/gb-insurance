import SubmissionsDashboard from './SubmissionsDashboard';

export default function PublicSubmissionsDashboardSection() {
  return (
    <section id="dashboard" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-4">dashboard</h2>
          <p className="text-muted-foreground text-lg">
            View all customer submissions and insurance inquiries
          </p>
        </div>
        <SubmissionsDashboard showTitle={false} />
      </div>
    </section>
  );
}
