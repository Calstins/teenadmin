// app/dashboard/ analytics / page.tsx;
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Overview } from '@/components/dashboard/overview';
import { ProgressDistribution } from '@/components/analytics/progess-distribution';
import { ChallengePerformance } from '@/components/analytics/challenge-performance';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: ['analytics-overview', selectedYear, selectedMonth],
    queryFn: () =>
      analyticsAPI.getProgressOverview({
        year: selectedYear,
        month: selectedMonth,
      }),
  });

  const analytics = data?.data || [];

  const totalStats = analytics.reduce(
    (acc: any, challenge: any) => ({
      totalParticipants:
        acc.totalParticipants + challenge.stats.totalParticipants,
      totalCompleted: acc.totalCompleted + challenge.stats.completedCount,
      averageProgress: acc.averageProgress + challenge.stats.averageProgress,
    }),
    { totalParticipants: 0, totalCompleted: 0, averageProgress: 0 }
  );

  const overallCompletion =
    totalStats.totalParticipants > 0
      ? (totalStats.totalCompleted / totalStats.totalParticipants) * 100
      : 0;

  const avgProgress =
    analytics.length > 0 ? totalStats.averageProgress / analytics.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Challenge performance and participation insights
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-2 border rounded-md"
        >
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - 2 + i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
        <select
          value={selectedMonth || ''}
          onChange={(e) =>
            setSelectedMonth(
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Months</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleDateString('en-US', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Challenges
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.length}</div>
            <p className="text-xs text-muted-foreground">
              Published challenges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Participants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStats.totalParticipants}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all challenges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallCompletion.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Overall completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average progress</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading analytics...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Challenge Overview Chart */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Challenge Performance Overview</CardTitle>
              <CardDescription>
                Participation and completion rates by challenge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Overview data={analytics} />
            </CardContent>
          </Card>

          {/* Challenge Performance List */}
          <Card>
            <CardHeader>
              <CardTitle>Challenge Performance</CardTitle>
              <CardDescription>Detailed breakdown by challenge</CardDescription>
            </CardHeader>
            <CardContent>
              <ChallengePerformance challenges={analytics} />
            </CardContent>
          </Card>

          {/* Progress Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Distribution</CardTitle>
              <CardDescription>
                How teens are progressing through challenges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressDistribution challenges={analytics} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
