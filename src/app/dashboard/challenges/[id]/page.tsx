// app/dashboard/challenges/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengesAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Calendar,
    Trophy,
    Users,
    DollarSign,
    Plus,
    Edit,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { TasksList } from '@/components/tasks/tasks-list';
import { EditChallengeDialog } from '@/components/challenges/edit-challenge-dialog';

export default function ChallengeDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const challengeId = params.id as string;
    const queryClient = useQueryClient();

    const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
    const [editChallengeDialogOpen, setEditChallengeDialogOpen] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['challenge', challengeId],
        queryFn: async () => {
            const response = await challengesAPI.getById(challengeId);
            return response.data;
        },
    });

    const publishMutation = useMutation({
        mutationFn: challengesAPI.publish,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] });
            queryClient.invalidateQueries({ queryKey: ['challenges'] });
            toast.success('Challenge published successfully!');
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || 'Failed to publish challenge'
            );
        },
    });

    const challenge = data;

    const getStatusBadge = () => {
        if (!challenge) return null;

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

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading challenge...</p>
            </div>
        );
    }

    if (error || !challenge) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <p className="text-red-600">Error loading challenge</p>
                <Button className="mt-4" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <div className="flex items-center space-x-3">
                            <h2 className="text-3xl font-bold tracking-tight">
                                {challenge.theme}
                            </h2>
                            {getStatusBadge()}
                        </div>
                        <p className="text-muted-foreground">
                            {new Date(challenge.goLiveDate).toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setEditChallengeDialogOpen(true)}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Challenge
                    </Button>
                    {!challenge.isPublished && (
                        <Button
                            onClick={() => publishMutation.mutate(challengeId)}
                            disabled={publishMutation.isPending}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Publish
                        </Button>
                    )}
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{challenge._count.tasks}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {challenge.tasks?.filter((t: any) => t.isRequired).length || 0}{' '}
                            required
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Participants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {challenge._count.progress}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Teens enrolled
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Badge Price</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {challenge.badge
                                ? formatCurrency(challenge.badge.price)
                                : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Monthly badge
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium">
                            {challenge.isPublished ? 'Published' : 'Draft'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {challenge.isActive ? 'Active' : 'Inactive'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Challenge Details */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Challenge Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Challenge Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Instructions</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {challenge.instructions}
                                </p>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Go Live Date</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDateTime(challenge.goLiveDate)}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Closing Date</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDateTime(challenge.closingDate)}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="font-semibold text-sm mb-1">Created By</h4>
                                <p className="text-sm text-muted-foreground">
                                    {challenge.createdBy.name} ({challenge.createdBy.email})
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatDateTime(challenge.createdAt)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tasks Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Tasks</CardTitle>
                                    <CardDescription>
                                        Manage tasks for this challenge
                                    </CardDescription>
                                </div>
                                <Button onClick={() => setCreateTaskDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Task
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <TasksList
                                tasks={challenge.tasks || []}
                                challengeId={challengeId}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Badge Info */}
                <div className="space-y-6">
                    {challenge.badge && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Badge</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-center">
                                    <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                                        {challenge.badge.imageUrl ? (
                                            <img
                                                src={challenge.badge.imageUrl}
                                                alt={challenge.badge.name}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <Trophy className="h-16 w-16 text-white" />
                                        )}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h4 className="font-semibold">{challenge.badge.name}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {challenge.badge.description}
                                    </p>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Price</span>
                                    <span className="font-semibold text-lg">
                                        {formatCurrency(challenge.badge.price)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <Badge variant={challenge.badge.isActive ? 'default' : 'secondary'}>
                                        {challenge.badge.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    Published Status
                                </span>
                                {challenge.isPublished ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                                )}
                            </div>

                            <Separator />

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    Active Status
                                </span>
                                {challenge.isActive ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-gray-400" />
                                )}
                            </div>

                            <Separator />

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    Required Tasks
                                </span>
                                <span className="font-medium">
                                    {challenge.tasks?.filter((t: any) => t.isRequired).length || 0}
                                </span>
                            </div>

                            <Separator />

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    Optional Tasks
                                </span>
                                <span className="font-medium">
                                    {challenge.tasks?.filter((t: any) => !t.isRequired).length || 0}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialogs */}
            <CreateTaskDialog
                open={createTaskDialogOpen}
                onOpenChange={setCreateTaskDialogOpen}
                challengeId={challengeId}
            />

            <EditChallengeDialog
                open={editChallengeDialogOpen}
                onOpenChange={setEditChallengeDialogOpen}
                challenge={challenge}
            />
        </div>
    );
}