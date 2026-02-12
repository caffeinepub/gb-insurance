import { CustomerForm } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  forms: CustomerForm[];
}

export default function DashboardStats({ forms }: DashboardStatsProps) {
  const totalSubmissions = forms.length;

  // Calculate today's submissions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = BigInt(today.getTime() * 1_000_000);
  
  const todaySubmissions = forms.filter(
    (form) => form.timestamp >= todayTimestamp
  ).length;

  // Calculate last 7 days submissions
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const sevenDaysTimestamp = BigInt(sevenDaysAgo.getTime() * 1_000_000);
  
  const last7DaysSubmissions = forms.filter(
    (form) => form.timestamp >= sevenDaysTimestamp
  ).length;

  const stats = [
    {
      title: 'Total Submissions',
      value: totalSubmissions,
      icon: Users,
      description: 'All time',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: "Today's Submissions",
      value: todaySubmissions,
      icon: Calendar,
      description: 'Last 24 hours',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Last 7 Days',
      value: last7DaysSubmissions,
      icon: TrendingUp,
      description: 'Weekly submissions',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border-2 border-primary/20 shadow-light hover:shadow-gold transition-smooth bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wide">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
