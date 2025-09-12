'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengesAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Calendar,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { CreateChallengeDialog } from '@/components/challenges/create-challenge-dialog';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function ChallengesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['challenges', selectedYear, searchTerm],
    queryFn: () =>
      challengesAPI.getAll({
        year: selectedYear,
        search: searchTerm || undefined,
      }),
  });

  const publishMutation = useMutation({
    mutationFn: challengesAPI.publish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Challenge published successfully!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to publish challenge'
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: challengesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Challenge deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to delete challenge'
      );
    },
  });

  const challenges = data?.data?.challenges || [];

  const getStatusBadge = (challenge: any) => {
    if (!challenge.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (!challenge.isPublished) {
      return <Badge variant="outline">Draft</Badge>;
    }

    const now = new Date();
    const goLive = new Date(challenge.goLiveDate);
    const closing = new Date(challenge.closingDate);

    if (now < goLive) {
      return <Badge variant="default">Scheduled</Badge>;
    }
    if (now >= goLive && now <= closing) {
      return (
        <Badge variant="default" className="bg-green-600">
          Active
        </Badge>
      );
    }
    return <Badge variant="secondary">Completed</Badge>;
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading challenges</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Challenges</h2>
          <p className="text-muted-foreground">
            Manage monthly challenges and tasks
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Challenge
        </Button>
      </div>

      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search challenges..."
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

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
                    <CardTitle className="text-lg">{challenge.theme}</CardTitle>
                    <CardDescription>
                      {new Date(challenge.goLiveDate).toLocaleDateString(
                        'en-US',
                        {
                          month: 'long',
                          year: 'numeric',
                        }
                      )}
                    </CardDescription>
                  </div>
                  {getStatusBadge(challenge)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tasks:</span>
                    <span className="font-medium">
                      {challenge._count.tasks}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Participants:</span>
                    <span className="font-medium">
                      {challenge._count.progress}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Badge Price:</span>
                    <span className="font-medium">
                      {challenge.badge
                        ? formatCurrency(challenge.badge.price)
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created by:</span>
                    <span className="font-medium">
                      {challenge.createdBy.name}
                    </span>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>

                    {user?.role === 'ADMIN' && !challenge.isPublished && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => publishMutation.mutate(challenge.id)}
                        disabled={publishMutation.isPending}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    )}

                    {user?.role === 'ADMIN' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Challenge
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;
                              {challenge.theme}
                              &quot;? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                deleteMutation.mutate(challenge.id)
                              }
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {challenges.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No challenges found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new challenge.
          </p>
        </div>
      )}

      <CreateChallengeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
