// components/dashboard/stats-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileText, Trophy } from 'lucide-react';

interface StatsCardsProps {
  analytics: any[] | undefined;
  teens: any;
  submissions: any;
}

export function StatsCards({ analytics, teens, submissions }: StatsCardsProps) {
  // Ensure analytics is an array before using reduce
  const analyticsArray = Array.isArray(analytics) ? analytics : [];

  const totalParticipants = analyticsArray.reduce(
    (sum, challenge) => sum + (challenge.stats?.totalParticipants || 0),
    0
  );

  const totalChallenges = analyticsArray.length;

  const pendingSubmissions =
    submissions?.submissions?.filter((sub: any) => sub.status === 'PENDING')
      .length || 0;

  const stats = [
    {
      title: 'Total Teens',
      value: teens?.pagination?.total || 0,
      description: 'Registered users',
      icon: Users,
    },
    {
      title: 'Active Challenges',
      value: totalChallenges,
      description: 'This year',
      icon: Calendar,
    },
    {
      title: 'Total Participants',
      value: totalParticipants,
      description: 'Across all challenges',
      icon: Users,
    },
    {
      title: 'Pending Reviews',
      value: pendingSubmissions,
      description: 'Awaiting review',
      icon: FileText,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
