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
    Trophy,
    DollarSign,
    Users,
    CheckCircle,
    XCircle,
    Calendar,
    Award,
    TrendingUp,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ViewBadgeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    badge: any;
}

export function ViewBadgeDialog({
    open,
    onOpenChange,
    badge,
}: ViewBadgeDialogProps) {
    if (!badge) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                                {badge.imageUrl ? (
                                    <img
                                        src={badge.imageUrl}
                                        alt={badge.name}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <Trophy className="h-8 w-8 text-white" />
                                )}
                            </div>
                            <div>
                                <DialogTitle className="text-2xl">{badge.name}</DialogTitle>
                                <DialogDescription className="mt-1">
                                    Badge Details
                                </DialogDescription>
                            </div>
                        </div>
                        <Badge variant={badge.isActive ? 'default' : 'secondary'}>
                            {badge.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="px-6 py-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Badge Information */}
                            <div className="space-y-6">
                                {/* Badge Details */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center space-x-2">
                                        <Award className="h-4 w-4" />
                                        <span>Badge Information</span>
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                                        <div>
                                            <label className="text-sm text-muted-foreground">
                                                Name
                                            </label>
                                            <p className="text-sm font-medium mt-1">{badge.name}</p>
                                        </div>
                                        <Separator />
                                        <div>
                                            <label className="text-sm text-muted-foreground">
                                                Description
                                            </label>
                                            <p className="text-sm mt-1 whitespace-pre-wrap">
                                                {badge.description}
                                            </p>
                                        </div>
                                        <Separator />
                                        <div>
                                            <label className="text-sm text-muted-foreground">
                                                Image URL
                                            </label>
                                            <p className="text-sm mt-1 break-all text-blue-600 dark:text-blue-400">
                                                {badge.imageUrl}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Challenge Association */}
                                {badge.challenge && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold flex items-center space-x-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Associated Challenge</span>
                                        </h4>
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                                            <div>
                                                <label className="text-sm text-muted-foreground">
                                                    Challenge Theme
                                                </label>
                                                <p className="text-sm font-medium mt-1">
                                                    {badge.challenge.theme}
                                                </p>
                                            </div>
                                            <Separator />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm text-muted-foreground">
                                                        Year
                                                    </label>
                                                    <p className="text-sm font-medium mt-1">
                                                        {badge.challenge.year}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="text-sm text-muted-foreground">
                                                        Month
                                                    </label>
                                                    <p className="text-sm font-medium mt-1">
                                                        {new Date(
                                                            badge.challenge.year,
                                                            badge.challenge.month - 1
                                                        ).toLocaleDateString('en-US', { month: 'long' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Status */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold">Status</h4>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Badge Status
                                            </span>
                                            {badge.isActive ? (
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
                            </div>

                            {/* Right Column - Pricing & Statistics */}
                            <div className="space-y-6">
                                {/* Pricing */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center space-x-2">
                                        <DollarSign className="h-4 w-4" />
                                        <span>Pricing</span>
                                    </h4>
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Badge Price
                                            </span>
                                            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                                                {formatCurrency(badge.price)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Amount teens pay to purchase this badge
                                        </p>
                                    </div>
                                </div>

                                {/* Statistics */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4" />
                                        <span>Statistics</span>
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    {badge._count?.teenBadges || 0}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Total Purchases
                                            </p>
                                        </div>

                                        {badge._count?.teenBadges > 0 && (
                                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                        {formatCurrency(
                                                            badge.price * (badge._count?.teenBadges || 0)
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    Total Revenue
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Badge Preview */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold">Badge Preview</h4>
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-lg flex flex-col items-center justify-center min-h-[200px]">
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                                            {badge.imageUrl ? (
                                                <img
                                                    src={badge.imageUrl}
                                                    alt={badge.name}
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            ) : (
                                                <Trophy className="h-16 w-16 text-white" />
                                            )}
                                        </div>
                                        <p className="text-center font-semibold mt-4">
                                            {badge.name}
                                        </p>
                                        <p className="text-center text-sm text-muted-foreground mt-1">
                                            {badge.challenge?.theme}
                                        </p>
                                    </div>
                                </div>

                                {/* Engagement Metrics */}
                                {badge._count?.teenBadges > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold">Engagement</h4>
                                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-medium">
                                                    Purchase Rate
                                                </span>
                                                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                                    {badge._count?.teenBadges || 0} teens
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                This badge has been purchased by{' '}
                                                {badge._count?.teenBadges || 0} teen
                                                {badge._count?.teenBadges !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                )}
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