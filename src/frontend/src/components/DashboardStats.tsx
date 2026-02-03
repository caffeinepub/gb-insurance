import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, TrendingUp, Clock } from 'lucide-react';
import type { CustomerForm } from '../backend';

interface DashboardStatsProps {
  forms: CustomerForm[];
}

export default function DashboardStats({ forms }: DashboardStatsProps) {
  const totalSubmissions = forms.length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySubmissions = forms.filter(form => {
    const formDate = new Date(Number(form.timestamp) / 1000000);
    formDate.setHours(0, 0, 0, 0);
    return formDate.getTime() === today.getTime();
  }).length;

  const insuranceTypeCounts: Record<string, number> = {};
  forms.forEach(form => {
    form.insuranceInterests.forEach(interest => {
      insuranceTypeCounts[interest] = (insuranceTypeCounts[interest] || 0) + 1;
    });
  });

  const mostPopular = Object.entries(insuranceTypeCounts).sort((a, b) => b[1] - a[1])[0];
  const mostPopularType = mostPopular ? mostPopular[0] : 'N/A';

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const recentSubmissions = forms.filter(form => {
    const formDate = new Date(Number(form.timestamp) / 1000000);
    return formDate >= last7Days;
  }).length;

  const stats = [
    {
      title: 'Total Submissions',
      value: totalSubmissions,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Today',
      value: todaySubmissions,
      icon: Clock,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Last 7 Days',
      value: recentSubmissions,
      icon: TrendingUp,
      color: 'text-secondary',
      bgColor: 'bg-secondary/20',
    },
    {
      title: 'Most Popular',
      value: mostPopularType.charAt(0).toUpperCase() + mostPopularType.slice(1),
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className="border-2 border-primary/20 transition-smooth hover:shadow-gold hover:-translate-y-1 animate-scale-in bg-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-foreground">
                {stat.title}
              </CardTitle>
              <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center transition-smooth hover:scale-110 border-2 border-primary/30 shadow-light`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

