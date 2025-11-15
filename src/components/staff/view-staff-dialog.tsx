'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    User,
    Mail,
    Calendar,
    CheckCircle,
    XCircle,
    Trophy,
    FileText,
    Shield,
    TrendingUp,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ViewStaffDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    staff: any;
}

export function ViewStaffDialog({
    open,
    onOpenChange,
    staff,
}: ViewStaffDialogProps) {
    if (!staff) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                                <AvatarFallback className="text-lg">
                                    {staff.name
                                        .split(' ')
                                        .map((n: string) => n[0])
                                        .join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle className="text-2xl">{staff.name}</DialogTitle>
                                <DialogDescription className="mt-1">
                                    Staff Member Profile
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                            <Badge
                                variant={staff.role === 'ADMIN' ? 'default' : 'secondary'}
                            >
                                {staff.role}
                            </Badge>
                            <Badge variant={staff.isActive ? 'default' : 'secondary'}>
                                {staff.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="px-6 py-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Personal Information */}
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center space-x-2">
                                        <User className="h-4 w-4" />
                                        <span>Account Information</span>
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground flex items-center space-x-2">
                                                <Mail className="h-3 w-3" />
                                                <span>Email</span>
                                            </span>
                                            <span className="text-sm font-medium">{staff.email}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground flex items-center space-x-2">
                                                <Shield className="h-3 w-3" />
                                                <span>Role</span>
                                            </span>
                                            <Badge
                                                variant={
                                                    staff.role === 'ADMIN' ? 'default' : 'secondary'
                                                }
                                            >
                                                {staff.role}
                                            </Badge>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground flex items-center space-x-2">
                                                <Calendar className="h-3 w-3" />
                                                <span>Joined</span>
                                            </span>
                                            <span className="text-sm font-medium">
                                                {formatDateTime(staff.createdAt)}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground flex items-center space-x-2">
                                                <Calendar className="h-3 w-3" />
                                                <span>Last Updated</span>
                                            </span>
                                            <span className="text-sm font-medium">
                                                {formatDateTime(staff.updatedAt)}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Account Status
                                            </span>
                                            {staff.isActive ? (
                                                <div className="flex items-center space-x-1 text-green-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Active</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-1 text-gray-400">
                                                    <XCircle className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Inactive</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Role Permissions */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center space-x-2">
                                        <Shield className="h-4 w-4" />
                                        <span>Permissions</span>
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                                        {staff.role === 'ADMIN' ? (
                                            <>
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm">Full system access</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm">Manage staff members</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm">
                                                        Create and publish challenges
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm">Review submissions</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm">Manage badges</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center space-x-2">
                                                    <XCircle className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-muted-foreground">
                                                        Cannot manage staff
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm">Create challenges</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <XCircle className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-muted-foreground">
                                                        Cannot publish challenges
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm">Review submissions</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm">View badges</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Activity & Statistics */}
                            <div className="space-y-6">
                                {/* Statistics */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4" />
                                        <span>Activity Statistics</span>
                                    </h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    {staff._count.createdChallenges}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Challenges Created
                                            </p>
                                        </div>

                                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                    {staff._count.createdTasks}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Tasks Created
                                            </p>
                                        </div>

                                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                    {staff._count.reviewedSubmissions}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Submissions Reviewed
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Summary */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold">Activity Summary</h4>
                                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-4 rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium">
                                                Overall Contribution
                                            </span>
                                            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                                {staff._count.createdChallenges +
                                                    staff._count.createdTasks +
                                                    staff._count.reviewedSubmissions >
                                                    0
                                                    ? 'Active Contributor'
                                                    : 'New Member'}
                                            </span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Total Actions:
                                                </span>
                                                <span className="font-medium">
                                                    {staff._count.createdChallenges +
                                                        staff._count.createdTasks +
                                                        staff._count.reviewedSubmissions}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Member Since:
                                                </span>
                                                <span className="font-medium">
                                                    {new Date(staff.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Timeline */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold">Account Timeline</h4>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                                        <div className="flex items-start space-x-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Account Created</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDateTime(staff.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="flex items-start space-x-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Last Updated</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDateTime(staff.updatedAt)}
                                                </p>
                                            </div>
                                        </div>
                                        {staff.lastLoginAt && (
                                            <>
                                                <Separator />
                                                <div className="flex items-start space-x-2">
                                                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">Last Login</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDateTime(staff.lastLoginAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="px-6 py-4 border-t shrink-0 bg-background">
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}