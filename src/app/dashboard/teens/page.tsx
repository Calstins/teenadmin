'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { teensAPI } from '@/lib/api';
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
  Search,
  Eye,
  LayoutGrid,
  Table2,
  ChevronLeft,
  ChevronRight,
  User,
  Award,
  FileText,
  Calendar,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { ViewTeenDialog } from '@/components/teens/view-teen-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Teen {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    submissions: number;
    badges: number;
    progress: number;
  };
}

export default function TeensPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTeen, setSelectedTeen] = useState<Teen | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['teens', searchTerm, statusFilter],
    queryFn: async () => {
      console.log('🔍 Fetching teens with search:', searchTerm);
      const response = await teensAPI.getAll({
        search: searchTerm || undefined,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      });
      console.log('✅ Teens API response:', response.data);
      return response.data;
    },
  });

  const teens: Teen[] = data?.data?.teens || [];

  // Pagination
  const totalPages = Math.ceil(teens.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTeens = teens.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleView = (teen: Teen) => {
    setSelectedTeen(teen);
    setViewDialogOpen(true);
  };

  if (error) {
    console.error('❌ Teens fetch error:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-600">
          Error loading teens: {(error as any).message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Teens Management
          </h2>
          <p className="text-muted-foreground">View and manage teen accounts</p>
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
            placeholder="Search teens by name or email..."
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading teens...</p>
        </div>
      ) : viewMode === 'table' ? (
        // TABLE VIEW
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teen</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Badges</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTeens.map((teen: Teen) => (
                  <TableRow key={teen.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {teen.name
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{teen.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {teen.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{teen.age}</TableCell>
                    <TableCell className="text-sm">
                      {teen.gender || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={teen.isActive ? 'default' : 'secondary'}>
                        {teen.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {teen._count.submissions}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Award className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{teen._count.badges}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{teen._count.progress}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(teen.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(teen)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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
                {Math.min(endIndex, teens.length)} of {teens.length} teens
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
            {paginatedTeens.map((teen: Teen) => (
              <Card
                key={teen.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {teen.name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{teen.name}</CardTitle>
                        <CardDescription>{teen.email}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={teen.isActive ? 'default' : 'secondary'}>
                      {teen.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Age:</span>
                      <span className="font-medium">{teen.age}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="font-medium">
                        {teen.gender || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Submissions:
                      </span>
                      <span className="font-medium">
                        {teen._count.submissions}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Badges:</span>
                      <span className="font-medium">{teen._count.badges}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-medium">
                        {teen._count.progress}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Joined:</span>
                      <span className="font-medium text-xs">
                        {formatDateTime(teen.createdAt)}
                      </span>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleView(teen)}
                      >
                        <Eye className="mr-2 h-3 w-3" />
                        View Details
                      </Button>
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
                {Math.min(endIndex, teens.length)} of {teens.length} teens
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

      {teens.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No teens found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      <ViewTeenDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        teen={selectedTeen}
      />
    </div>
  );
}