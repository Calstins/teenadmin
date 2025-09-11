'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { raffleAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Gift, Users, Trophy, Sparkles } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { CreateRaffleDialog } from '@/components/raffle/create-raffle-dialogue';
import { useAuth } from '@/lib/auth';

export default function RafflePage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: eligibleData, isLoading: eligibleLoading } = useQuery({
    queryKey: ['raffle-eligible', selectedYear],
    queryFn: () => raffleAPI.getEligible(selectedYear),
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['raffle-history'],
    queryFn: () => raffleAPI.getHistory(),
  });

  const drawMutation = useMutation({
    mutationFn: raffleAPI.createDraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raffle-eligible'] });
      queryClient.invalidateQueries({ queryKey: ['raffle-history'] });
      toast.success('Raffle draw completed successfully!');
      setCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to create raffle draw'
      );
    },
  });

  const eligible = eligibleData?.data || {};
  const history = historyData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Raffle System</h2>
          <p className="text-muted-foreground">
            Manage year-end raffle draws for badge collectors
          </p>
        </div>
        {user?.role === 'ADMIN' && !eligible.raffleDraw && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Gift className="mr-2 h-4 w-4" />
            Create Raffle Draw
          </Button>
        )}
      </div>

      {/* Year Filter */}
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
      </div>

      {/* Current Year Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Eligible Teens
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {eligible.eligibleCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Purchased all 12 badges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Raffle Status</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {eligible.raffleDraw ? 'Complete' : 'Pending'}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedYear} raffle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prize</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {eligible.raffleDraw ? '🎁' : '⏳'}
            </div>
            <p className="text-xs text-muted-foreground">
              {eligible.raffleDraw ? eligible.raffleDraw.prize : 'Not set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Winner</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {eligible.raffleDraw ? '👑' : '❓'}
            </div>
            <p className="text-xs text-muted-foreground">
              {eligible.raffleDraw ? 'Selected' : 'TBD'}
            </p>
          </CardContent>
        </Card>
      </div>

      {eligibleLoading ? (
        <div className="text-center py-8">Loading raffle data...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Eligible Teens */}
          <Card>
            <CardHeader>
              <CardTitle>Eligible Teens ({selectedYear})</CardTitle>
              <CardDescription>
                Teens who purchased all 12 badges this year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {eligible.eligibleTeens?.map((entry: any) => (
                  <div
                    key={entry.id}
                    className="flex items-center space-x-3 p-2 border rounded"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {entry.teen.name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{entry.teen.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.teen.email}
                      </p>
                    </div>
                    <Badge variant="outline">Age {entry.teen.age}</Badge>
                  </div>
                ))}
                {(!eligible.eligibleTeens ||
                  eligible.eligibleTeens.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">
                    No eligible teens for {selectedYear}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Raffle Draw */}
          <Card>
            <CardHeader>
              <CardTitle>{selectedYear} Raffle Draw</CardTitle>
              <CardDescription>Current year raffle information</CardDescription>
            </CardHeader>
            <CardContent>
              {eligible.raffleDraw ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🎉</div>
                    <h3 className="text-lg font-semibold">
                      {eligible.raffleDraw.prize}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {eligible.raffleDraw.description}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Draw Date:</span>
                      <span>{formatDateTime(eligible.raffleDraw.drawnAt)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">
                        Total Eligible:
                      </span>
                      <span>{eligible.eligibleCount}</span>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      🏆 Winner Selected!
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                      The raffle draw has been completed for {selectedYear}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gift className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    No Raffle Draw Yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create a raffle draw for {selectedYear} when ready.
                  </p>
                  {user?.role === 'ADMIN' && eligible.eligibleCount > 0 && (
                    <Button
                      className="mt-4"
                      onClick={() => setCreateDialogOpen(true)}
                    >
                      Create Raffle Draw
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Raffle History */}
      <Card>
        <CardHeader>
          <CardTitle>Raffle History</CardTitle>
          <CardDescription>Past raffle draws and winners</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="text-center py-4">Loading history...</div>
          ) : (
            <div className="space-y-4">
              {history.map((raffle: any) => (
                <div key={raffle.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{raffle.prize}</h4>
                      <p className="text-sm text-muted-foreground">
                        {raffle.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Drawn: {formatDateTime(raffle.drawnAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge>{raffle.year}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {raffle.eligibleCount} eligible
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No raffle history available
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateRaffleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        year={selectedYear}
        eligibleCount={eligible.eligibleCount || 0}
        onSubmit={(data) => drawMutation.mutate(data)}
        isLoading={drawMutation.isPending}
      />
    </div>
  );
}
