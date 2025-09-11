// app/dashboard/badges/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI, challengesAPI } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Trophy, DollarSign, Users, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function BadgesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: badgeStats, isLoading: statsLoading } = useQuery({
    queryKey: ['badge-stats', selectedYear],
    queryFn: () => analyticsAPI.getBadgeStats({ year: selectedYear }),
  });

  const { data: challengesData, isLoading: challengesLoading } = useQuery({
    queryKey: ['challenges-badges', selectedYear, searchTerm],
    queryFn: () =>
      challengesAPI.getAll({
        year: selectedYear,
        search: searchTerm || undefined,
      }),
  });

  const challenges = challengesData?.data?.challenges || [];
  const stats = badgeStats?.data || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Badges</h2>
          <p className="text-muted-foreground">
            Manage badges and view sales statistics
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Badges</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{challenges.length}</div>
            <p className="text-xs text-muted-foreground">Available this year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchased</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.statusBreakdown?.purchased || 0) +
                (stats.statusBreakdown?.earned || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.statusBreakdown?.earned || 0}
            </div>
            <p className="text-xs text-muted-foreground">Fully completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search badges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
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
      </div>

      {/* Badges Grid */}
      {challengesLoading || statsLoading ? (
        <div className="text-center py-8">Loading badges...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge: any) => (
            <Card
              key={challenge.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {challenge.badge?.name || challenge.theme}
                    </CardTitle>
                    <CardDescription>
                      {new Date(0, challenge.month - 1).toLocaleDateString(
                        'en-US',
                        { month: 'long' }
                      )}{' '}
                      {challenge.year}
                    </CardDescription>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                    🏆
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">
                      {challenge.badge
                        ? formatCurrency(challenge.badge.price)
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Participants:</span>
                    <span className="font-medium">
                      {challenge._count.progress}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Description:</span>
                    <p className="text-xs mt-1 text-gray-600 dark:text-gray-300">
                      {challenge.badge?.description || challenge.instructions}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Status:
                    </span>
                    <Badge
                      variant={challenge.isPublished ? 'default' : 'outline'}
                    >
                      {challenge.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {challenges.length === 0 && !challengesLoading && (
        <div className="text-center py-8">
          <Trophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No badges found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No badges match your current search.
          </p>
        </div>
      )}
    </div>
  );
}
