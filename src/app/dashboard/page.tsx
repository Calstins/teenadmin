'use client';

import { useQuery } from '@tanstack/react-query';
import {
  analyticsAPI,
  challengesAPI,
  teensAPI,
  submissionsAPI,
} from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Overview } from '@/components/dashboard/overview';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const currentYear = new Date().getFullYear();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', currentYear],
    queryFn: () => analyticsAPI.getProgressOverview({ year: currentYear }),
  });

  const { data: challenges, isLoading: challengesLoading } = useQuery({
    queryKey: ['challenges', currentYear],
    queryFn: () => challengesAPI.getAll({ year: currentYear, limit: 5 }),
  });

  const { data: teens, isLoading: teensLoading } = useQuery({
    queryKey: ['teens-stats'],
    queryFn: () => teensAPI.getAll({ limit: 5 }),
  });

  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['recent-submissions'],
    queryFn: () => submissionsAPI.getReviewQueue({ limit: 5 }),
  });

  if (
    analyticsLoading ||
    challengesLoading ||
    teensLoading ||
    submissionsLoading
  ) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with TeenShapers today.
        </p>
      </div>

      <StatsCards
        analytics={analytics?.data}
        teens={teens?.data}
        submissions={submissions?.data}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={analytics?.data} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest submissions and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity
              submissions={submissions?.data?.submissions}
              challenges={challenges?.data?.challenges}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
