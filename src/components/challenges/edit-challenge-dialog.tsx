// components/challenges/edit-challenge-dialog.tsx - FIXED VERSION
'use client';

import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { challengesAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUploader from '@/components/ui/image-uploader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

// Badge data is REQUIRED for edit as well
const editChallengeSchema = z.object({
    theme: z.string().min(3, 'Theme must be at least 3 characters'),
    instructions: z
        .string()
        .min(10, 'Instructions must be at least 10 characters'),
    goLiveDate: z.string(),
    closingDate: z.string(),
    badgeData: z.object({
        name: z.string().min(1, 'Badge name is required'),
        description: z.string().min(1, 'Badge description is required'),
        imageUrl: z.string().url('Must be a valid URL'),
        price: z.number().min(0, 'Price must be positive'),
    }),
});

type EditChallengeFormData = z.infer<typeof editChallengeSchema>;

interface EditChallengeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    challenge: any;
}

export function EditChallengeDialog({
    open,
    onOpenChange,
    challenge,
}: EditChallengeDialogProps) {
    const queryClient = useQueryClient();

    const form = useForm<EditChallengeFormData>({
        resolver: zodResolver(editChallengeSchema),
        defaultValues: {
            theme: '',
            instructions: '',
            goLiveDate: '',
            closingDate: '',
            badgeData: {
                name: '',
                description: '',
                imageUrl: '',
                price: 0,
            },
        },
    });

    // Reset form when challenge changes
    useEffect(() => {
        if (challenge) {
            const goLiveDate = new Date(challenge.goLiveDate);
            const closingDate = new Date(challenge.closingDate);

            form.reset({
                theme: challenge.theme,
                instructions: challenge.instructions,
                goLiveDate: goLiveDate.toISOString().slice(0, 16),
                closingDate: closingDate.toISOString().slice(0, 16),
                badgeData: challenge.badge
                    ? {
                        name: challenge.badge.name,
                        description: challenge.badge.description,
                        imageUrl: challenge.badge.imageUrl,
                        price: challenge.badge.price,
                    }
                    : {
                        name: '',
                        description: '',
                        imageUrl: '',
                        price: 0,
                    },
            });
        }
    }, [challenge, form]);

    const updateMutation = useMutation({
        mutationFn: (data: EditChallengeFormData) =>
            challengesAPI.update(challenge.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenges'] });
            queryClient.invalidateQueries({ queryKey: ['challenge', challenge.id] });
            toast.success('Challenge updated successfully!');
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || 'Failed to update challenge'
            );
        },
    });

    const onSubmit: SubmitHandler<EditChallengeFormData> = (values) => {
        // Validate badge image is present
        if (!values.badgeData.imageUrl) {
            toast.error('Badge Image Required', {
                description: 'Please upload a badge image.',
            });
            return;
        }

        updateMutation.mutate(values);
    };

    if (!challenge) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
                    <DialogTitle>Edit Challenge</DialogTitle>
                    <DialogDescription>
                        Update the challenge details for {challenge.theme}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="px-6 py-4">
                        {/* Info Notice */}
                        <Alert className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-950">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-900 dark:text-blue-100">
                                <strong>Editing {new Date(challenge.year, challenge.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Challenge</strong>
                                <br />
                                {challenge.badge
                                    ? 'You can update the challenge details and badge information.'
                                    : 'This challenge needs a badge. Please add badge information below.'}
                            </AlertDescription>
                        </Alert>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Basic Information</h3>

                                    <FormField
                                        control={form.control}
                                        name="theme"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Theme *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Self-Discovery, Leadership"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="instructions"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Instructions *</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Describe what teens should expect this month..."
                                                        className="min-h-[120px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="goLiveDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Go Live Date *</FormLabel>
                                                    <FormControl>
                                                        <Input type="datetime-local" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="closingDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Closing Date *</FormLabel>
                                                    <FormControl>
                                                        <Input type="datetime-local" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Badge Details */}
                                <div className="space-y-4">
                                    <Card className="border-2 border-orange-200 dark:border-orange-900">
                                        <CardHeader className="bg-orange-50 dark:bg-orange-950">
                                            <CardTitle>
                                                {challenge.badge ? 'Update Badge' : 'Add Badge (Required)'}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {challenge.badge
                                                    ? 'Modify the badge details for this challenge.'
                                                    : 'This challenge needs a badge before it can be published.'}
                                            </p>
                                        </CardHeader>
                                        <CardContent className="space-y-4 pt-6">
                                            <FormField
                                                control={form.control}
                                                name="badgeData.name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Badge Name *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="e.g., Self-Discovery Champion"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="badgeData.description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Badge Description *</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Describe what this badge represents..."
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* ✅ FIXED: Use correct folder path */}
                                            <FormField
                                                control={form.control}
                                                name="badgeData.imageUrl"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Badge Image *</FormLabel>
                                                        <FormControl>
                                                            <ImageUploader
                                                                images={field.value ? [field.value] : []}
                                                                onImagesChange={(urls) => field.onChange(urls[0] || '')}
                                                                multiple={false}
                                                                folder="teenshapers/badges"
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Upload a badge image (recommended: 512x512px)
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="badgeData.price"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Badge Price (₦) *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                placeholder="500.00"
                                                                {...field}
                                                                onChange={(e) =>
                                                                    field.onChange(Number(e.target.value))
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            </form>
                        </Form>
                    </div>
                </ScrollArea>

                <DialogFooter className="px-6 py-4 border-t shrink-0 bg-background">
                    <div className="flex justify-between w-full">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending || !form.watch('badgeData.imageUrl')}
                            onClick={form.handleSubmit(onSubmit)}
                        >
                            {updateMutation.isPending ? 'Updating...' : 'Update Challenge'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}