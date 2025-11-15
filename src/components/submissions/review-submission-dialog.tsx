// components/submissions/review-submission-dialog.tsx
'use client';

import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  FileText,
  Image as ImageIcon,
  Video,
  Download,
  ExternalLink,
  Calendar,
  User,
  Trophy,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

const reviewSchema = z.object({
  score: z
    .number()
    .min(0, 'Score must be at least 0')
    .max(100, 'Score cannot exceed 100')
    .optional(),
  status: z.enum(['APPROVED', 'REJECTED']).refine((val) => val !== undefined, {
    message: 'Please select a status',
  }),
  reviewNote: z
    .string()
    .max(500, 'Review note cannot exceed 500 characters')
    .optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: any;
  onReview: (data: ReviewFormData) => void;
  isLoading?: boolean;
}

export function ReviewSubmissionDialog({
  open,
  onOpenChange,
  submission,
  onReview,
  isLoading = false,
}: ReviewSubmissionDialogProps) {
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      score: undefined,
      status: undefined,
      reviewNote: '',
    },
  });

  // Reset form when submission changes
  useEffect(() => {
    if (submission) {
      form.reset({
        score: submission.score || undefined,
        status: submission.status === 'PENDING' ? undefined : submission.status,
        reviewNote: submission.reviewNote || '',
      });
    }
  }, [submission, form]);

  const onSubmit: SubmitHandler<ReviewFormData> = (data) => {
    onReview(data);
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'TEXT':
        return <FileText className="h-4 w-4" />;
      case 'IMAGE':
        return <ImageIcon className="h-4 w-4" />;
      case 'VIDEO':
        return <Video className="h-4 w-4" />;
      case 'QUIZ':
        return <Trophy className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const renderSubmissionContent = (content: any, taskType: string) => {
    if (!content)
      return <p className="text-muted-foreground">No content submitted</p>;

    switch (taskType) {
      case 'TEXT':
        return (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">
              {content.text || 'No text content'}
            </p>
          </div>
        );
      case 'QUIZ':
        return (
          <div className="space-y-2">
            {content.answers ? (
              Object.entries(content.answers).map(
                ([question, answer]: [string, any]) => (
                  <div
                    key={question}
                    className="border-l-2 border-primary/20 pl-3"
                  >
                    <p className="font-medium text-sm">{question}</p>
                    <p className="text-sm text-muted-foreground">
                      {String(answer)}
                    </p>
                  </div>
                )
              )
            ) : (
              <p className="text-muted-foreground">Quiz answers submitted</p>
            )}
          </div>
        );
      case 'FORM':
        return (
          <div className="space-y-2">
            {typeof content === 'object' ? (
              Object.entries(content).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="text-muted-foreground">{String(value)}</span>
                </div>
              ))
            ) : (
              <p>{String(content)}</p>
            )}
          </div>
        );
      case 'PICK_ONE':
        return (
          <div className="bg-primary/5 p-3 rounded-lg">
            <p className="font-medium">Selected Option:</p>
            <p className="text-sm mt-1">
              {content.selectedOption || 'No option selected'}
            </p>
            {content.explanation && (
              <div className="mt-2">
                <p className="font-medium text-sm">Explanation:</p>
                <p className="text-sm text-muted-foreground">
                  {content.explanation}
                </p>
              </div>
            )}
          </div>
        );
      case 'CHECKLIST':
        return (
          <div className="space-y-1">
            {content.items ? (
              content.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center ${item.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'
                      }`}
                  >
                    {item.completed && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                  <span
                    className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Checklist submitted</p>
            )}
          </div>
        );
      default:
        return (
          <div className="text-sm">
            {typeof content === 'string' ? (
              <p className="whitespace-pre-wrap">{content}</p>
            ) : (
              <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-auto">
                {JSON.stringify(content, null, 2)}
              </pre>
            )}
          </div>
        );
    }
  };

  if (!submission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
          <DialogTitle className="flex items-center space-x-2">
            {getTaskTypeIcon(submission.task.taskType)}
            <span>Review Submission</span>
          </DialogTitle>
          <DialogDescription>
            Review and score the submission from {submission.teen.name}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Submission Details */}
              <div className="space-y-4">
                {/* Teen Info */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={submission.teen.profilePhoto} />
                    <AvatarFallback>
                      {submission.teen.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{submission.teen.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {submission.teen.email}
                    </p>
                  </div>
                </div>

                {/* Task Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Task Details</span>
                    </h4>
                    {getStatusBadge(submission.status)}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2">
                    <div>
                      <p className="font-medium">{submission.task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {submission.task.challenge.theme}
                      </p>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tab:</span>
                        <span className="ml-2 font-medium">
                          {submission.task.tabName}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2 font-medium">
                          {submission.task.taskType}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Submitted:</span>
                        <span className="ml-2 font-medium">
                          {formatDateTime(submission.submittedAt)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max Score:</span>
                        <span className="ml-2 font-medium">
                          {submission.task.maxScore || 100}
                        </span>
                      </div>
                    </div>
                    {submission.task.description && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm font-medium mb-1">
                            Task Description:
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {submission.task.description}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Submission Content */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Submission Content</span>
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg max-h-64 overflow-y-auto">
                    {renderSubmissionContent(
                      submission.content,
                      submission.task.taskType
                    )}
                  </div>
                </div>

                {/* File Attachments */}
                {submission.fileUrls && submission.fileUrls.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">
                      File Attachments ({submission.fileUrls.length})
                    </h4>
                    <div className="space-y-2">
                      {submission.fileUrls.map((url: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="flex items-center space-x-2">
                            {url.includes('image') ? (
                              <ImageIcon className="h-4 w-4" />
                            ) : url.includes('video') ? (
                              <Video className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                            <span className="text-sm">Attachment {index + 1}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" asChild>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <a href={url} download>
                                <Download className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Review Form */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>Review & Score</span>
                </h4>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Review Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select review status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="APPROVED">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                                  <span>Approve</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="REJECTED">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                                  <span>Reject</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="score"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Score (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                min="0"
                                max={submission.task.maxScore || 100}
                                placeholder={`0 - ${submission.task.maxScore || 100
                                  }`}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? Number(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Star className="h-4 w-4 text-yellow-500" />
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Assign a score out of {submission.task.maxScore || 100}{' '}
                            points (visible only to admin/staff)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reviewNote"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Review Note (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add feedback for the teen (optional)..."
                              className="min-h-[100px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Provide constructive feedback or notes about the
                            submission ({field.value?.length || 0}/500 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Current Score Display */}
                    {submission.score && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Current Score: {submission.score}/
                          {submission.task.maxScore || 100}
                        </p>
                        {submission.reviewNote && (
                          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                            Previous Note: {submission.reviewNote}
                          </p>
                        )}
                      </div>
                    )}
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Fixed Footer */}
        <DialogFooter className="px-6 py-4 border-t shrink-0 bg-background">
          <div className="flex w-full justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.setValue('status', 'REJECTED');
                  form.handleSubmit(onSubmit)();
                }}
                disabled={isLoading}
              >
                Quick Reject
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.setValue('status', 'APPROVED');
                  form.handleSubmit(onSubmit)();
                }}
                disabled={isLoading}
              >
                Quick Approve
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                onClick={form.handleSubmit(onSubmit)}
              >
                {isLoading ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}