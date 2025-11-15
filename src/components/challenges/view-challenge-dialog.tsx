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
    Calendar,
    Trophy,
    Users,
    DollarSign,
    User,
    CheckCircle,
    XCircle,
    Clock,
    Award,
    FileText,
} from 'lucide-react';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ViewChallengeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    challenge: any;
}

export function ViewChallengeDialog({
    open,
    onOpenChange,
    challenge,
}: ViewChallengeDialogProps) {
    if (!challenge) return null;

    const getStatusBadge = () => {
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

    const getMonthName = () => {
        return new Date(challenge.year, challenge.month - 1).toLocaleDateString(
            'en-US',
            {
                month: 'long',
                year: 'numeric',
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="text-2xl">{challenge.theme}</DialogTitle>
                            <DialogDescription className="mt-1">
                                {getMonthName()}
                            </DialogDescription>
                        </div>
                        {getStatusBadge()}
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="px-6 py-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Challenge Details */}
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center space-x-2">
                                        <FileText className="h-4 w-4" />
                                        <span>Challenge Information</span>
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                                        <div>
                                            <label className="text-sm text-muted-foreground">
                                                Instructions
                                            </label>
                                            <p className="text-sm mt-1 whitespace-pre-wrap">
                                                {challenge.instructions}
                                            </p>
                                        </div>
                                        <Separator />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm text-muted-foreground flex items-center space-x-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Year</span>
                                                </label>
                                                <p className="text-sm font-medium mt-1">
                                                    {challenge.year}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm text-muted-foreground flex items-center space-x-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Month</span>
                                                </label>
                                                <p className="text-sm font-medium mt-1">
                                                    {new Date(challenge.year, challenge.month - 1).toLocaleDateString(
                                                        'en-US',
                                                        { month: 'long' }
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center space-x-2">
                                        <Clock className="h-4 w-4" />
                                        <span>Schedule</span>
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                                        <div>
                                            <label className="text-sm text-muted-foreground">
                                                Go Live Date
                                            </label>
                                            <p className="text-sm font-medium mt-1">
                                                {formatDateTime(challenge.goLiveDate)}
                                            </p>
                                        </div>
                                        <Separator />
                                        <div>
                                            <label className="text-sm text-muted-foreground">
                                                Closing Date
                                            </label>
                                            <p className="text-sm font-medium mt-1">
                                                {formatDateTime(challenge.closingDate)}
                                            </p>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Published
                                            </span>
                                            {challenge.isPublished ? (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Active
                                            </span>
                                            {challenge.isActive ? (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Creator Info */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center space-x-2">
                                        <User className="h-4 w-4" />
                                        <span>Created By</span>
                                    </h4>
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>
                                                {challenge.createdBy.name
                                                    .split(' ')
                                                    .map((n: string) => n[0])
                                                    .join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">
                                                {challenge.createdBy.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {challenge.createdBy.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Badge & Stats */}
                            <div className="space-y-6">
                                {/* Badge Info */}
                                {challenge.badge && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold flex items-center space-x-2">
                                            <Award className="h-4 w-4" />
                                            <span>Monthly Badge</span>
                                        </h4>
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                                                    {challenge.badge.imageUrl ? (
                                                        <img
                                                            src={challenge.badge.imageUrl}
                                                            alt={challenge.badge.name}
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <Trophy className="h-8 w-8 text-white" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{challenge.badge.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {challenge.badge.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground flex items-center space-x-1">
                                                    <DollarSign className="h-3 w-3" />
                                                    <span>Price</span>
                                                </span>
                                                <span className="font-semibold text-lg">
                                                    {formatCurrency(challenge.badge.price)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Statistics */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold">Statistics</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    {challenge._count.tasks}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Total Tasks
                                            </p>
                                        </div>

                                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                    {challenge._count.progress}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Participants
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold">Timeline</h4>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                                        <div className="flex items-start space-x-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Created</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDateTime(challenge.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div
                                                className={`w-2 h-2 rounded-full mt-1.5 ${challenge.isPublished ? 'bg-green-500' : 'bg-gray-400'
                                                    }`}
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    {challenge.isPublished ? 'Published' : 'Not Published'}
                                                </p>
                                                {challenge.publishedAt && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDateTime(challenge.publishedAt)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div
                                                className={`w-2 h-2 rounded-full mt-1.5 ${new Date() >= new Date(challenge.goLiveDate)
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-400'
                                                    }`}
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Goes Live</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDateTime(challenge.goLiveDate)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div
                                                className={`w-2 h-2 rounded-full mt-1.5 ${new Date() >= new Date(challenge.closingDate)
                                                    ? 'bg-red-500'
                                                    : 'bg-gray-400'
                                                    }`}
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Closes</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDateTime(challenge.closingDate)}
                                                </p>
                                            </div>
                                        </div>
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