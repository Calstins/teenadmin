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
  LayoutGrid,
  Table2,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Users,
  DollarSign,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { CreateChallengeDialog } from '@/components/challenges/create-challenge-dialog';
import { ViewChallengeDialog } from '@/components/challenges/view-challenge-dialog';
import { EditChallengeDialog } from '@/components/challenges/edit-challenge-dialog';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Challenge {
  id: string;
  year: number;
  month: number;
  theme: string;
  instructions: string;
  goLiveDate: string;
  closingDate: string;
  isPublished: boolean;
  isActive: boolean;
  badge: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
  } | null;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    tasks: number;
    progress: number;
  };
  createdAt: string;
}

export default function ChallengesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['challenges', selectedYear, searchTerm, statusFilter],
    queryFn: () =>
      challengesAPI.getAll({
        year: selectedYear,
        search: searchTerm || undefined,
        isPublished: statusFilter === 'published' ? true : statusFilter === 'draft' ? false : undefined,
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

  // Pagination
  const totalPages = Math.ceil(challenges.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedChallenges = challenges.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleYearChange = (value: number) => {
    setSelectedYear(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleView = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setViewDialogOpen(true);
  };

  const handleEdit = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setEditDialogOpen(true);
  };

  const getStatusBadge = (challenge: Challenge) => {
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
        <p className="text-red-600">Error loading challenges: {(error as any).message}</p>
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
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <Table2 className="h-4 w-4 mr-2" />
            Table
          </Button>
          <Button
            variant={viewMode === 'board' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('board')}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Board
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Challenge
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search challenges by theme or instructions..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={selectedYear}
          onChange={(e) => handleYearChange(Number(e.target.value))}
          className="px-3 py-2 border rounded-md bg-background min-w-[120px]"
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
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background min-w-[140px]"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading challenges...</p>
        </div>
      ) : viewMode === 'table' ? (
        // TABLE VIEW
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Theme</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Badge Price</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedChallenges.map((challenge: Challenge) => (
                  <TableRow key={challenge.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{challenge.theme}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {challenge.instructions}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {new Date(challenge.goLiveDate).toLocaleDateString(
                            'en-US',
                            {
                              month: 'long',
                              year: 'numeric',
                            }
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(challenge.goLiveDate).toLocaleDateString()} - {new Date(challenge.closingDate).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(challenge)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Trophy className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{challenge._count.tasks}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{challenge._count.progress}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {challenge.badge
                            ? formatCurrency(challenge.badge.price)
                            : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {challenge.createdBy.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(challenge)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(challenge)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user?.role === 'ADMIN' && !challenge.isPublished && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => publishMutation.mutate(challenge.id)}
                            disabled={publishMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {user?.role === 'ADMIN' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{' '}
                {Math.min(endIndex, challenges.length)} of {challenges.length}{' '}
                challenges
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        // BOARD VIEW
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedChallenges.map((challenge: Challenge) => (
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
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {challenge.instructions}
                    </p>
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleView(challenge)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(challenge)}
                      >
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

          {/* Pagination for Board View */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{' '}
                {Math.min(endIndex, challenges.length)} of {challenges.length}{' '}
                challenges
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
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

      <ViewChallengeDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        challenge={selectedChallenge}
      />

      <EditChallengeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        challenge={selectedChallenge}
      />
    </div>
  );
}