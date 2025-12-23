// teenadmin/src/app/dashboard/badges/page.tsx - 
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengesAPI, badgesAPI } from '@/lib/api';
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
  Plus,
  Edit,
  Trash2,
  Trophy,
  Eye,
  LayoutGrid,
  Table2,
  ChevronLeft,
  ChevronRight,
  Award,
  DollarSign,
  Users,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ViewBadgeDialog } from '@/components/badges/view-badge-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ImageUploader from '@/components/ui/image-uploader';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BadgeData {
  id: string;
  challengeId: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  isActive: boolean;
  challenge?: {
    id: string;
    theme: string;
    year: number;
    month: number;
  };
  _count?: {
    teenBadges: number;
  };
}

interface ChallengeData {
  id: string;
  theme: string;
  year: number;
  month: number;
  badge?: any;
}

export default function BadgeManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch badges
  const { data: badgesData, isLoading: badgesLoading } = useQuery({
    queryKey: ['admin-badges', selectedYear, searchTerm, statusFilter],
    queryFn: async () => {
      const response = await badgesAPI.getAll({
        year: selectedYear,
        search: searchTerm,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      });
      return response;
    },
  });

  // Fetch challenges for dropdown
  const { data: challengesData } = useQuery({
    queryKey: ['challenges-for-badges', selectedYear],
    queryFn: () => challengesAPI.getAll({ year: selectedYear }),
  });

  const badges: BadgeData[] = badgesData?.data || [];
  const challenges: ChallengeData[] = challengesData?.data?.challenges || [];

  // IMPORTANT: Filter challenges to only show those WITHOUT badges
  const availableChallenges = challenges.filter((c) => !c.badge);

  // Pagination
  const totalPages = Math.ceil(badges.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBadges = badges.slice(startIndex, endIndex);

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

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => badgesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] });
      queryClient.invalidateQueries({ queryKey: ['challenges-for-badges'] });
      toast.success('Badge created successfully!');
      setCreateDialogOpen(false);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create badge';

      if (message.includes('already exists')) {
        toast.error('Badge Already Exists', {
          description: message,
        });
      } else {
        toast.error('Error', { description: message });
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ badgeId, data }: { badgeId: string; data: any }) =>
      badgesAPI.update(badgeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] });
      toast.success('Badge updated successfully!');
      setEditDialogOpen(false);
      setSelectedBadge(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update badge');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (badgeId: string) => badgesAPI.delete(badgeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] });
      queryClient.invalidateQueries({ queryKey: ['challenges-for-badges'] });
      toast.success('Badge deleted successfully!');
      setDeleteDialogOpen(false);
      setSelectedBadge(null);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete badge';
      toast.error('Delete Failed', {
        description: message,
      });
    },
  });

  const handleView = (badge: BadgeData) => {
    setSelectedBadge(badge);
    setViewDialogOpen(true);
  };

  const handleEdit = (badge: BadgeData) => {
    setSelectedBadge(badge);
    setEditDialogOpen(true);
  };

  const handleDelete = (badge: BadgeData) => {
    setSelectedBadge(badge);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Badge Management
          </h2>
          <p className="text-muted-foreground">
            Create and manage challenge badges (one badge per challenge)
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
          {user?.role === 'ADMIN' && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              disabled={availableChallenges.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Badge
            </Button>
          )}
        </div>
      </div>

      {/* Show warning if no available challenges */}
      {availableChallenges.length === 0 && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900 dark:text-yellow-100">
            <strong>No Available Challenges:</strong> All challenges for {selectedYear} already have badges.
            Create a new challenge first, or select a different year.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search badges by name or challenge..."
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {badgesLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading badges...</p>
        </div>
      ) : viewMode === 'table' ? (
        // TABLE VIEW
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Badge</TableHead>
                  <TableHead>Challenge</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Purchases</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBadges.map((badge) => (
                  <TableRow key={badge.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                          {badge.imageUrl ? (
                            <img
                              src={badge.imageUrl}
                              alt={badge.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <Trophy className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{badge.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {badge.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">
                          {badge.challenge?.theme}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {badge.challenge?.year}/{badge.challenge?.month}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={badge.isActive ? 'default' : 'secondary'}>
                        {badge.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {formatCurrency(badge.price)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {badge._count?.teenBadges || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(badge)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user?.role === 'ADMIN' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(badge)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(badge)}
                            >
                              <Trash2 className="h-4 w-4" />
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
                {Math.min(endIndex, badges.length)} of {badges.length} badges
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
        // BOARD VIEW (Similar structure, keeping it concise)
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedBadges.map((badge) => (
              <Card
                key={badge.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{badge.name}</CardTitle>
                      <CardDescription>
                        {badge.challenge?.theme} ({badge.challenge?.year}/
                        {badge.challenge?.month})
                      </CardDescription>
                    </div>
                    {badge.imageUrl && (
                      <img
                        src={badge.imageUrl}
                        alt={badge.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {badge.description}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">
                        {formatCurrency(badge.price)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Purchases:</span>
                      <span className="font-medium">
                        {badge._count?.teenBadges || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Status:
                      </span>
                      <Badge
                        variant={badge.isActive ? 'default' : 'secondary'}
                      >
                        {badge.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleView(badge)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      {user?.role === 'ADMIN' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(badge)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(badge)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Board View Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{' '}
                {Math.min(endIndex, badges.length)} of {badges.length} badges
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

      {badges.length === 0 && !badgesLoading && (
        <div className="text-center py-8">
          <Trophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No badges found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {availableChallenges.length > 0
              ? 'Get started by creating a new badge.'
              : 'Create challenges first before adding badges.'}
          </p>
        </div>
      )}

      {/* Create Badge Dialog - WITH FILTERED CHALLENGES */}
      <CreateBadgeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        challenges={availableChallenges}  // ONLY PASS CHALLENGES WITHOUT BADGES
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      {/* Edit Badge Dialog */}
      <EditBadgeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        badge={selectedBadge}
        onSubmit={(data) =>
          updateMutation.mutate({ badgeId: selectedBadge!.id, data })
        }
        isLoading={updateMutation.isPending}
      />

      {/* View Badge Dialog */}
      <ViewBadgeDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        badge={selectedBadge}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Badge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedBadge?.name}&quot;?
              This action cannot be undone.
              {selectedBadge?._count && selectedBadge._count.teenBadges > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  Warning: This badge has {selectedBadge._count.teenBadges}{' '}
                  purchase(s). Deleting it will affect teen progress and raffle eligibility.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedBadge && deleteMutation.mutate(selectedBadge.id)
              }
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


// Create Badge Dialog Component WITH IMAGE UPLOADER
interface CreateBadgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenges: ChallengeData[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

function CreateBadgeDialog({
  open,
  onOpenChange,
  challenges,
  onSubmit,
  isLoading,
}: CreateBadgeDialogProps) {
  const [formData, setFormData] = useState({
    challengeId: '',
    name: '',
    description: '',
    imageUrl: '',
    price: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.imageUrl) {
      toast.error('Badge image is required');
      return;
    }

    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (urls: string[]) => {
    setFormData((prev) => ({ ...prev, imageUrl: urls[0] || '' }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Badge</DialogTitle>
          <DialogDescription>
            Create a badge for a challenge (one badge per challenge)
          </DialogDescription>
        </DialogHeader>

        {challenges.length === 0 && (
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900 dark:text-yellow-100">
              All challenges for this year already have badges. Create a new challenge first.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="challengeId">Challenge *</Label>
            <Select
              value={formData.challengeId}
              onValueChange={(value) => handleChange('challengeId', value)}
              disabled={challenges.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a challenge without a badge" />
              </SelectTrigger>
              <SelectContent>
                {challenges.map((challenge) => (
                  <SelectItem key={challenge.id} value={challenge.id}>
                    {challenge.theme} ({challenge.year}/{challenge.month})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Only challenges without badges are shown
            </p>
          </div>

          <div>
            <Label htmlFor="name">Badge Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Faith Foundations Badge"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what this badge represents..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="imageUrl">Badge Image *</Label>
            <ImageUploader
              images={formData.imageUrl ? [formData.imageUrl] : []}
              onImagesChange={handleImageChange}
              multiple={false}
              folder="teenshapers/badges"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Required: Upload a badge image (512x512px recommended)
            </p>
          </div>

          <div>
            <Label htmlFor="price">Price (₦) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="500.00"
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.imageUrl || challenges.length === 0}
            >
              {isLoading ? 'Creating...' : 'Create Badge'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Badge Dialog Component WITH IMAGE UPLOADER
interface EditBadgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: BadgeData | null;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

function EditBadgeDialog({
  open,
  onOpenChange,
  badge,
  onSubmit,
  isLoading,
}: EditBadgeDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    price: '',
    isActive: true,
  });

  // Update form when badge changes
  useEffect(() => {
    if (badge) {
      setFormData({
        name: badge.name || '',
        description: badge.description || '',
        imageUrl: badge.imageUrl || '',
        price: badge.price?.toString() || '',
        isActive: badge.isActive ?? true,
      });
    }
  }, [badge]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.imageUrl) {
      toast.error('Badge image is required');
      return;
    }

    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
    });
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (urls: string[]) => {
    setFormData((prev) => ({ ...prev, imageUrl: urls[0] || '' }));
  };

  if (!badge) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Badge</DialogTitle>
          <DialogDescription>
            Update badge details for {badge.challenge?.theme}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Badge Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-imageUrl">Badge Image *</Label>
            <ImageUploader
              images={formData.imageUrl ? [formData.imageUrl] : []}
              onImagesChange={handleImageChange}
              multiple={false}
              folder="teenshapers/badges"
            />
          </div>

          <div>
            <Label htmlFor="edit-price">Price (₦) *</Label>
            <Input
              id="edit-price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit-isActive"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="edit-isActive">Active</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.imageUrl}>
              {isLoading ? 'Updating...' : 'Update Badge'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
