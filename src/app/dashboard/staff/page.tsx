'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffAPI } from '@/lib/api';
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
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Eye,
  LayoutGrid,
  Table2,
  ChevronLeft,
  ChevronRight,
  Trophy,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { CreateStaffDialog } from '@/components/staff/create-staff-dialog';
import { EditStaffDialog } from '@/components/staff/edit-staff-dialog';
import { ViewStaffDialog } from '@/components/staff/view-staff-dialog';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    createdChallenges: number;
    createdTasks: number;
    reviewedSubmissions: number;
  };
}

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['staff', searchTerm, roleFilter, statusFilter],
    queryFn: async () => {
      console.log('🔍 Fetching staff with filters');
      const response = await staffAPI.getAll({
        search: searchTerm || undefined,
        role: roleFilter || undefined,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      });
      console.log('✅ Staff API response:', response.data);
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      staffAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member updated successfully!');
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to update staff member'
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: staffAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to delete staff member'
      );
    },
  });

  const staff: StaffMember[] = data?.data?.staff || [];

  // Pagination
  const totalPages = Math.ceil(staff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStaff = staff.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleView = (member: StaffMember) => {
    setSelectedStaff(member);
    setViewDialogOpen(true);
  };

  const handleEdit = (member: StaffMember) => {
    setSelectedStaff(member);
    setEditDialogOpen(true);
  };

  const toggleStatus = (staffMember: StaffMember) => {
    updateMutation.mutate({
      id: staffMember.id,
      data: { isActive: !staffMember.isActive },
    });
  };

  // Only admins can access this page
  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Access denied. Admin role required.</p>
      </div>
    );
  }

  if (error) {
    console.error('❌ Staff fetch error:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-600">
          Error loading staff: {(error as any).message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Staff Management
          </h2>
          <p className="text-muted-foreground">
            Manage admin and staff accounts
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
            Add Staff Member
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff members by name or email..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background min-w-[120px]"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="STAFF">Staff</option>
        </select>
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
          <p className="mt-2 text-muted-foreground">Loading staff...</p>
        </div>
      ) : viewMode === 'table' ? (
        // TABLE VIEW
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Challenges</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStaff.map((member: StaffMember) => (
                  <TableRow key={member.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {member.name
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.role === 'ADMIN' ? 'default' : 'secondary'
                        }
                      >
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={member.isActive ? 'default' : 'secondary'}
                      >
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Trophy className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {member._count.createdChallenges}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {member._count.createdTasks}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {member._count.reviewedSubmissions}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(member.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(member)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(member)}
                          disabled={updateMutation.isPending}
                        >
                          {member.isActive ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        {member.id !== user.id && (
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
                                  Delete Staff Member
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;
                                  {member.name}&quot;? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteMutation.mutate(member.id)
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
                {Math.min(endIndex, staff.length)} of {staff.length} staff
                members
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
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
                        variant={
                          currentPage === page ? 'default' : 'outline'
                        }
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
            {paginatedStaff.map((member: StaffMember) => (
              <Card
                key={member.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {member.name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {member.name}
                        </CardTitle>
                        <CardDescription>{member.email}</CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1 mt-2">
                    <Badge
                      variant={
                        member.role === 'ADMIN' ? 'default' : 'secondary'
                      }
                    >
                      {member.role}
                    </Badge>
                    <Badge
                      variant={member.isActive ? 'default' : 'secondary'}
                    >
                      {member.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Challenges Created:
                      </span>
                      <span className="font-medium">
                        {member._count.createdChallenges}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Tasks Created:
                      </span>
                      <span className="font-medium">
                        {member._count.createdTasks}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reviews:</span>
                      <span className="font-medium">
                        {member._count.reviewedSubmissions}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Joined: {formatDateTime(member.createdAt)}
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleView(member)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(member)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(member)}
                        disabled={updateMutation.isPending}
                      >
                        {member.isActive ? (
                          <UserX className="h-3 w-3" />
                        ) : (
                          <UserCheck className="h-3 w-3" />
                        )}
                      </Button>

                      {member.id !== user.id && (
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
                                Delete Staff Member
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;
                                {member.name}&quot;? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(member.id)}
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
                {Math.min(endIndex, staff.length)} of {staff.length} staff
                members
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
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
                        variant={
                          currentPage === page ? 'default' : 'outline'
                        }
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

      {staff.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No staff members found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new staff member.
          </p>
        </div>
      )}

      <CreateStaffDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditStaffDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        staff={selectedStaff}
      />

      <ViewStaffDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        staff={selectedStaff}
      />
    </div>
  );
}