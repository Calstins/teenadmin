'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submissionsAPI } from '@/lib/api';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search,
  Eye,
  Star,
  CheckCircle,
  XCircle,
  LayoutGrid,
  Table2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { ReviewSubmissionDialog } from '@/components/submissions/review-submission-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Submission {
  id: string;
  teen: {
    name: string;
    email: string;
  };
  task: {
    title: string;
    taskType: string;
    tabName: string;
    challenge: {
      theme: string;
      year: number;
      month: number;
    };
  };
  content: any;
  fileUrls: string[];
  status: string;
  submittedAt: string;
  score?: number;
}

export default function SubmissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [taskTypeFilter, setTaskTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingSubmission, setReviewingSubmission] =
    useState<Submission | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['submissions', searchTerm, statusFilter, taskTypeFilter],
    queryFn: async () => {
      console.log('🔍 Fetching submissions with filters:', {
        searchTerm,
        statusFilter,
        taskTypeFilter,
      });
      const response = await submissionsAPI.getReviewQueue({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        taskType: taskTypeFilter || undefined,
      });
      console.log('✅ Submissions API response:', response.data);
      return response.data;
    },
  });

  // Log errors
  if (error) {
    console.error('❌ Submissions fetch error:', error);
  }

  const reviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      submissionsAPI.review(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast.success('Submission reviewed successfully!');
      setReviewDialogOpen(false);
    },
    onError: (error: any) => {
      console.error('Review error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to review submission'
      );
    },
  });

  const submissions = data?.data?.submissions || [];

  console.log('📊 Submissions array:', submissions);
  console.log('📊 Submissions count:', submissions.length);

  // Pagination logic
  const totalPages = Math.ceil(submissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubmissions = submissions.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleTaskTypeChange = (value: string) => {
    setTaskTypeFilter(value);
    setCurrentPage(1);
  };

  const handleReview = (submission: Submission) => {
    setReviewingSubmission(submission);
    setReviewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'TEXT':
        return '📝';
      case 'IMAGE':
        return '🖼️';
      case 'VIDEO':
        return '🎥';
      case 'QUIZ':
        return '❓';
      case 'CHECKLIST':
        return '✅';
      default:
        return '📋';
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">
          Error loading submissions: {(error as any).message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
          <p className="text-muted-foreground">
            Review and score teen submissions
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
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by teen name, task, or challenge..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background min-w-[140px]"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select
          value={taskTypeFilter}
          onChange={(e) => handleTaskTypeChange(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background min-w-[140px]"
        >
          <option value="">All Types</option>
          <option value="TEXT">📝 Text</option>
          <option value="IMAGE">🖼️ Image</option>
          <option value="VIDEO">🎥 Video</option>
          <option value="QUIZ">❓ Quiz</option>
          <option value="CHECKLIST">✅ Checklist</option>
          <option value="FORM">📋 Form</option>
          <option value="PICK_ONE">🎯 Pick One</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading submissions...</p>
        </div>
      ) : viewMode === 'table' ? (
        // TABLE VIEW
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teen</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Challenge</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSubmissions.map((submission: Submission) => (
                  <TableRow key={submission.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {submission.teen.name
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {submission.teen.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {submission.teen.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {submission.task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {submission.task.tabName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {submission.task.challenge.theme}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(
                          submission.task.challenge.year,
                          submission.task.challenge.month - 1
                        ).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span>{getTaskTypeIcon(submission.task.taskType)}</span>
                        <span className="text-xs">
                          {submission.task.taskType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      {submission.score ? (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="font-medium text-sm">
                            {submission.score}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(submission.submittedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReview(submission)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {submission.status === 'PENDING' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                reviewMutation.mutate({
                                  id: submission.id,
                                  data: { status: 'APPROVED' },
                                })
                              }
                              disabled={reviewMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                reviewMutation.mutate({
                                  id: submission.id,
                                  data: { status: 'REJECTED' },
                                })
                              }
                              disabled={reviewMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{' '}
                {Math.min(endIndex, submissions.length)} of {submissions.length}{' '}
                submissions
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
        // BOARD VIEW (Original Card View)
        <>
          <div className="space-y-4">
            {paginatedSubmissions.map((submission: Submission) => (
              <Card
                key={submission.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {submission.teen.name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {submission.teen.name}
                        </CardTitle>
                        <CardDescription>
                          {submission.task.title} •{' '}
                          {submission.task.challenge.theme}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">
                        {getTaskTypeIcon(submission.task.taskType)}
                      </span>
                      {getStatusBadge(submission.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="font-medium mb-1">Submission:</p>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {typeof submission.content === 'object' &&
                          submission.content.text ? (
                          <p className="line-clamp-2">
                            {submission.content.text}
                          </p>
                        ) : (
                          <p>Content submitted</p>
                        )}
                        {submission.fileUrls.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">
                              {submission.fileUrls.length} file(s) attached
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Submitted:</span>
                      <span>{formatDateTime(submission.submittedAt)}</span>
                    </div>

                    {submission.score && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Score:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="font-medium">
                            {submission.score}/100
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReview(submission)}
                      >
                        <Eye className="mr-2 h-3 w-3" />
                        Review
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          reviewMutation.mutate({
                            id: submission.id,
                            data: { status: 'APPROVED' },
                          })
                        }
                        disabled={reviewMutation.isPending}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          reviewMutation.mutate({
                            id: submission.id,
                            data: { status: 'REJECTED' },
                          })
                        }
                        disabled={reviewMutation.isPending}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls for Board View */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{' '}
                {Math.min(endIndex, submissions.length)} of {submissions.length}{' '}
                submissions
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

      {submissions.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No submissions found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Run the seed script to create sample submissions
          </p>
        </div>
      )}

      <ReviewSubmissionDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        submission={reviewingSubmission}
        onReview={(data) => {
          if (reviewingSubmission) {
            reviewMutation.mutate({ id: reviewingSubmission.id, data });
          }
        }}
        isLoading={reviewMutation.isPending}
      />
    </div>
  );
}