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
import { Search, Eye, Star, CheckCircle, XCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { ReviewSubmissionDialog } from '@/components/submissions/review-submission-dialog';

interface Submission {
  id: string;
  teen: {
    name: string;
  };
  task: {
    title: string;
    taskType: string;
    challenge: {
      theme: string;
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
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingSubmission, setReviewingSubmission] =
    useState<Submission | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['submissions', searchTerm, statusFilter],
    queryFn: () =>
      submissionsAPI.getReviewQueue({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      submissionsAPI.review(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast.success('Submission reviewed successfully!');
      setReviewDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to review submission'
      );
    },
  });

  const submissions = data?.data?.submissions || [];

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
    const iconClass = 'h-4 w-4';
    switch (type) {
      case 'TEXT':
        return <div className={iconClass}>📝</div>;
      case 'IMAGE':
        return <div className={iconClass}>🖼️</div>;
      case 'VIDEO':
        return <div className={iconClass}>🎥</div>;
      case 'QUIZ':
        return <div className={iconClass}>❓</div>;
      default:
        return <div className={iconClass}>📋</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
          <p className="text-muted-foreground">
            Review and score teen submissions
          </p>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading submissions...</div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission: Submission) => (
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
                    {getTaskTypeIcon(submission.task.taskType)}
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
                        <p>{submission.content.text}</p>
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
      />
    </div>
  );
}
