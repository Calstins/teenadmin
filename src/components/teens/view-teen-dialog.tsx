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
    Award,
    FileText,
    TrendingUp,
    Cake,
    UserCircle,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ViewTeenDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teen: any;
}

export function ViewTeenDialog({
    open,
    onOpenChange,
    teen,
}: ViewTeenDialogProps) {
    if (!teen) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                                <AvatarFallback className="text-lg">
                                    {teen.name
                                        .split(' ')
                                        .map((n: string) => n[0])
                                        .join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle className="text-2xl">{teen.name}</DialogTitle>
                                <DialogDescription className="mt-1">
                                    Teen Profile Details
                                </DialogDescription>
                            </div>
                        </div>
                        <Badge variant={teen.isActive ? 'default' : 'secondary'}>
                            {teen.isActive ? 'Active' : 'Inactive'}
                        </Badge>
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
                                        <span>Personal Information</span>
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground flex items-center space-x-2">
                                                <Mail className="h-3 w-3" />
                                                <span>Email</span>
                                            </span>
                                            <span className="text-sm font-medium">{teen.email}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground flex items-center space-x-2">
                                                <Cake className="h-3 w-3" />
                                                <span>Age</span>
                                            </span>
                                            <span className="text-sm font-medium">{teen.age}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground flex items-center space-x-2">
                                                <UserCircle className="h-3 w-3" />
                                                <span>Gender</span>
                                            </span>
                                            <span className="text-sm font-medium">
                                                {teen.gender || 'Not specified'}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground flex items-center space-x-2">
                                                <Calendar className="h-3 w-3" />
                                                <span>Joined</span>
                                            </span>
                                            <span className="text-sm font-medium">
                                                {formatDateTime(teen.createdAt)}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Account Status
                                            </span>
                                            {teen.isActive ? (
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

                                {/* Contact & Additional Info */}
                                {(teen.phone || teen.address || teen.parentEmail) && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold">Contact Information</h4>
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                                            {teen.phone && (
                                                <>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">
                                                            Phone
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {teen.phone}
                                                        </span>
                                                    </div>
                                                    <Separator />
                                                </>
                                            )}
                                            {teen.address && (
                                                <>
                                                    <div>
                                                        <span className="text-sm text-muted-foreground block mb-1">
                                                            Address
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {teen.address}
                                                        </span>
                                                    </div>
                                                    <Separator />
                                                </>
                                            )}
                                            {teen.parentEmail && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">
                                                        Parent/Guardian Email
                                                    </span>
                                                    <span className="text-sm font-medium">
                                                        {teen.parentEmail}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Activity & Statistics */}
                            <div className="space-y-6">
                                {/* Statistics */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4" />
                                        <span>Activity Statistics</span>
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    {teen._count.submissions}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Submissions
                                            </p>
                                        </div>

                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                                <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                                    {teen._count.badges}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Badges Earned
                                            </p>
                                        </div>

                                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg col-span-2">
                                            <div className="flex items-center justify-between">
                                                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                    {teen._count.progress}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Challenges In Progress
                                            </p>
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
                                                    {formatDateTime(teen.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        {teen.updatedAt && (
                                            <>
                                                <Separator />
                                                <div className="flex items-start space-x-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">Last Updated</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDateTime(teen.updatedAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {teen.lastLoginAt && (
                                            <>
                                                <Separator />
                                                <div className="flex items-start space-x-2">
                                                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">Last Login</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDateTime(teen.lastLoginAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Engagement Score */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold">Engagement</h4>
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium">
                                                Overall Participation
                                            </span>
                                            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                                {teen._count.submissions > 0
                                                    ? Math.min(
                                                        100,
                                                        Math.round(
                                                            (teen._count.submissions * 10 +
                                                                teen._count.badges * 20) /
                                                            2
                                                        )
                                                    )
                                                    : 0}
                                                %
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${teen._count.submissions > 0
                                                        ? Math.min(
                                                            100,
                                                            Math.round(
                                                                (teen._count.submissions * 10 +
                                                                    teen._count.badges * 20) /
                                                                2
                                                            )
                                                        )
                                                        : 0
                                                        }%`,
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Based on submissions and badges earned
                                        </p>
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