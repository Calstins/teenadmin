// components/challenges/create-challenge-dialog.tsx
'use client';

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
import { CloudinaryUploadWidget } from '@/components/ui/cloudinary-upload-widget';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';

// UPDATED: Badge data is now REQUIRED, not optional
const createChallengeSchema = z.object({
  year: z.number().min(2024, 'Year must be 2024 or later'),
  month: z.number().min(1, 'Invalid month').max(12, 'Invalid month'),
  theme: z.string().min(3, 'Theme must be at least 3 characters'),
  instructions: z
    .string()
    .min(10, 'Instructions must be at least 10 characters'),
  goLiveDate: z.string(),
  closingDate: z.string(),
  // CHANGED: Badge is now REQUIRED
  badgeData: z.object({
    name: z.string().min(1, 'Badge name is required'),
    description: z.string().min(1, 'Badge description is required'),
    imageUrl: z.string().url('Must be a valid URL'),
    price: z.number().min(0, 'Price must be positive'),
  }), // Removed .optional()
});

type CreateChallengeFormData = z.infer<typeof createChallengeSchema>;

interface CreateChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChallengeDialog({
  open,
  onOpenChange,
}: CreateChallengeDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<CreateChallengeFormData>({
    resolver: zodResolver(createChallengeSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
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

  const createMutation = useMutation({
    mutationFn: challengesAPI.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Challenge and badge created successfully!', {
        description: 'All active teens will be notified when you publish.',
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create challenge';

      // Show specific error messages
      if (message.includes('already exists')) {
        toast.error('Challenge Already Exists', {
          description: message,
        });
      } else if (message.includes('Badge information is required')) {
        toast.error('Badge Required', {
          description: 'Each challenge must have exactly one badge.',
        });
      } else {
        toast.error('Error', {
          description: message,
        });
      }
    },
  });

  const onSubmit: SubmitHandler<CreateChallengeFormData> = (values) => {
    // Validate that badge image is uploaded
    if (!values.badgeData.imageUrl) {
      toast.error('Badge Image Required', {
        description: 'Please upload a badge image before creating the challenge.',
      });
      return;
    }

    createMutation.mutate(values);
  };

  // Helper to get month name
  const getMonthName = (monthNum: number) => {
    return new Date(2024, monthNum - 1).toLocaleDateString('en-US', {
      month: 'long',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
          <DialogTitle>Create New Challenge</DialogTitle>
          <DialogDescription>
            Create a new monthly challenge with badge. Each month can only have one challenge.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            {/* Important Notice */}
            <Alert className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-950">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 dark:text-blue-100">
                <strong>Important:</strong> Each challenge requires a badge. Only one challenge
                is allowed per month. If a challenge already exists for the selected month,
                you'll need to edit that challenge or choose a different month.
              </AlertDescription>
            </Alert>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="2024"
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
                    <FormField
                      control={form.control}
                      name="month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Month *</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              className="w-full px-3 py-2 border rounded-md bg-background"
                            >
                              {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                (m) => (
                                  <option key={m} value={m}>
                                    {new Date(2024, m - 1).toLocaleDateString(
                                      'en-US',
                                      { month: 'long' }
                                    )}
                                  </option>
                                )
                              )}
                            </select>
                          </FormControl>
                          <FormDescription>
                            Selected: {getMonthName(form.watch('month'))} {form.watch('year')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Self-Discovery, Leadership, Faith Foundations"
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
                        <FormDescription>
                          Provide clear instructions for teens about what this challenge involves.
                        </FormDescription>
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
                          <FormDescription>
                            When this challenge becomes available to teens
                          </FormDescription>
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
                          <FormDescription>
                            When this challenge ends
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Badge Details - NOW REQUIRED */}
                <div className="space-y-4">
                  <Card className="border-2 border-orange-200 dark:border-orange-900">
                    <CardHeader className="bg-orange-50 dark:bg-orange-950">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                          Monthly Badge (Required)
                        </CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Each challenge must have exactly one badge. Teens purchase this badge
                        to be eligible for the annual raffle draw.
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
                                placeholder="e.g., Faith Foundations Champion"
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

                      <FormField
                        control={form.control}
                        name="badgeData.imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Badge Image *</FormLabel>
                            <FormControl>
                              <CloudinaryUploadWidget
                                onUpload={(url) => field.onChange(url)}
                                currentImageUrl={field.value}
                                buttonText="Upload Badge Image"
                                folder="teenshapers/badges"
                              />
                            </FormControl>
                            <FormDescription>
                              Upload a badge image (recommended: 512x512px, PNG format with transparency)
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
                            <FormDescription>
                              Amount teens will pay to purchase this badge
                            </FormDescription>
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
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !form.watch('badgeData.imageUrl')}
              onClick={form.handleSubmit(onSubmit)}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Challenge & Badge'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}