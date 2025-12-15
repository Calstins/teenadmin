// app/dashboard/submissions/page.tsx -
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  ExternalLink,
  Calendar,
  Filter,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
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
    maxScore: number;
    challenge: {
      id: string;
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

// Month names
const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export default function SubmissionsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [taskTypeFilter, setTaskTypeFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [challengeFilter, setChallengeFilter] = useState('');

  // UI states
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // Available years (dynamic from data)
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableChallenges, setAvailableChallenges] = useState<any[]>([]);

  // Fetch submissions
  const { data, isLoading, error } = useQuery({
    queryKey: [
      'submissions',
      searchTerm,
      statusFilter,
      taskTypeFilter,
      monthFilter,
      yearFilter,
      challengeFilter,
    ],
    queryFn: async () => {
      const response = await submissionsAPI.getReviewQueue({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        taskType: taskTypeFilter || undefined,
        month: monthFilter || undefined,
        year: yearFilter || undefined,
        challengeId: challengeFilter || undefined,
      });
      return response.data;
    },
  });

  // Quick action mutations
  const reviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      submissionsAPI.review(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast.success('Submission reviewed successfully!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to review submission'
      );
    },
  });

  const submissions = data?.submissions || [];

  // Extract available years and challenges dynamically
  useEffect(() => {
    if (submissions.length > 0) {
      // Get unique years
      const years = Array.from<number>(
        new Set<number>(submissions.map((s: Submission) => s.task.challenge.year))
      ).sort((a, b) => b - a);
      setAvailableYears(years);

      // Get unique challenges
      const challengesMap = new Map();
      submissions.forEach((s: Submission) => {
        const challenge = s.task.challenge;
        if (!challengesMap.has(challenge.id)) {
          challengesMap.set(challenge.id, {
            id: challenge.id,
            theme: challenge.theme,
            year: challenge.year,
            month: challenge.month,
            label: `${challenge.theme} (${MONTHS[challenge.month - 1].label} ${challenge.year})`,
          });
        }
      });
      const challenges = Array.from(challengesMap.values()).sort(
        (a, b) => b.year - a.year || b.month - a.month
      );
      setAvailableChallenges(challenges);
    }
  }, [submissions]);

  // Filter submissions by month and year on client side for accurate count
  const filteredSubmissions = submissions.filter((submission: Submission) => {
    const challenge = submission.task.challenge;

    // Month filter
    if (monthFilter && challenge.month !== parseInt(monthFilter)) {
      return false;
    }

    // Year filter
    if (yearFilter && challenge.year !== parseInt(yearFilter)) {
      return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);

  // Navigation to detail page
  const viewSubmissionDetail = (submissionId: string) => {
    router.push(`/dashboard/submissions/${submissionId}`);
  };

  // Filter handlers
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

  const handleMonthChange = (value: string) => {
    setMonthFilter(value);
    setCurrentPage(1);
  };

  const handleYearChange = (value: string) => {
    setYearFilter(value);
    setCurrentPage(1);
    // Reset month when year changes
    if (value === '') {
      setMonthFilter('');
    }
  };

  const handleChallengeChange = (value: string) => {
    setChallengeFilter(value);
    setCurrentPage(1);
    // If challenge selected, auto-set year and month
    if (value) {
      const challenge = availableChallenges.find((c) => c.id === value);
      if (challenge) {
        setYearFilter(challenge.year.toString());
        setMonthFilter(challenge.month.toString());
      }
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTaskTypeFilter('');
    setMonthFilter('');
    setYearFilter('');
    setChallengeFilter('');
    setCurrentPage(1);
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
      case 'FORM':
        return '📋';
      case 'PICK_ONE':
        return '🎯';
      default:
        return '📋';
    }
  };

  // Count active filters
  const activeFiltersCount = [
    searchTerm,
    statusFilter,
    taskTypeFilter,
    monthFilter,
    yearFilter,
    challengeFilter,
  ].filter(Boolean).length;

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
          <p className="text-muted-foreground">
            Review and score teen submissions
            {filteredSubmissions.length < submissions.length && (
              <span className="text-primary ml-2">
                • {filteredSubmissions.length} of {submissions.length} shown
              </span>
            )}
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

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount}</Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                >
                  Clear All
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="space-y-4">
            {/* Row 1: Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by teen name, task, or challenge..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Row 2: Challenge, Year, Month */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Challenge Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Challenge</label>
                <Select value={challengeFilter} onValueChange={handleChallengeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Challenges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Challenges</SelectItem>
                    {availableChallenges.map((challenge) => (
                      <SelectItem key={challenge.id} value={challenge.id}>
                        {challenge.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Select value={yearFilter} onValueChange={handleYearChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Month Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <Select
                  value={monthFilter}
                  onValueChange={handleMonthChange}
                  disabled={!yearFilter}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={yearFilter ? 'All Months' : 'Select year first'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {MONTHS.map((month) => (
                      <SelectItem
                        key={month.value}
                        value={month.value.toString()}
                      >
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Status, Task Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Task Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Type</label>
                <Select value={taskTypeFilter} onValueChange={handleTaskTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="TEXT">📝 Text</SelectItem>
                    <SelectItem value="IMAGE">🖼️ Image</SelectItem>
                    <SelectItem value="VIDEO">🎥 Video</SelectItem>
                    <SelectItem value="QUIZ">❓ Quiz</SelectItem>
                    <SelectItem value="CHECKLIST">✅ Checklist</SelectItem>
                    <SelectItem value="FORM">📋 Form</SelectItem>
                    <SelectItem value="PICK_ONE">🎯 Pick One</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Loading State */}
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
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSubmissions.map((submission: Submission) => (
                  <TableRow
                    key={submission.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => viewSubmissionDetail(submission.id)}
                  >
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
                      <p className="text-sm font-medium">
                        {submission.task.challenge.theme}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {MONTHS[submission.task.challenge.month - 1].label}{' '}
                          {submission.task.challenge.year}
                        </span>
                      </div>
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
                            {submission.score}/{submission.task.maxScore}
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
                      <div
                        className="flex justify-end space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewSubmissionDetail(submission.id)}
                          title="View full details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>

                        {submission.status === 'PENDING' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                reviewMutation.mutate({
                                  id: submission.id,
                                  data: { status: 'APPROVED' },
                                });
                              }}
                              disabled={reviewMutation.isPending}
                              title="Quick approve"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                reviewMutation.mutate({
                                  id: submission.id,
                                  data: { status: 'REJECTED' },
                                });
                              }}
                              disabled={reviewMutation.isPending}
                              title="Quick reject"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{' '}
                {Math.min(endIndex, filteredSubmissions.length)} of{' '}
                {filteredSubmissions.length} submissions
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
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
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
          <div className="space-y-4">
            {paginatedSubmissions.map((submission: Submission) => (
              <Card
                key={submission.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => viewSubmissionDetail(submission.id)}
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
                        <div className="flex items-center space-x-1 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {MONTHS[submission.task.challenge.month - 1].label}{' '}
                            {submission.task.challenge.year}
                          </span>
                        </div>
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
                      <p className="font-medium mb-1">Submission Preview:</p>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {typeof submission.content === 'object' &&
                          submission.content.text ? (
                          <p className="line-clamp-2">
                            {submission.content.text}
                          </p>
                        ) : (
                          <p>Content submitted - Click to view details</p>
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
                            {submission.score}/{submission.task.maxScore}
                          </span>
                        </div>
                      </div>
                    )}

                    <div
                      className="flex space-x-2 pt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewSubmissionDetail(submission.id)}
                      >
                        <Eye className="mr-2 h-3 w-3" />
                        View Details
                      </Button>

                      {submission.status === 'PENDING' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              reviewMutation.mutate({
                                id: submission.id,
                                data: { status: 'APPROVED' },
                              });
                            }}
                            disabled={reviewMutation.isPending}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              reviewMutation.mutate({
                                id: submission.id,
                                data: { status: 'REJECTED' },
                              });
                            }}
                            disabled={reviewMutation.isPending}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </>
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
                {Math.min(endIndex, filteredSubmissions.length)} of{' '}
                {filteredSubmissions.length} submissions
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
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
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

      {/* Empty State */}
      {filteredSubmissions.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No submissions found</p>
          {activeFiltersCount > 0 ? (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-3">
                Try adjusting your filters
              </p>
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              Submissions will appear here once teens start submitting
            </p>
          )}
        </div>
      )}
    </div>
  );
}