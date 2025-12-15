// app/(dashboard)/submissions/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submissionsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    FileText,
    Image as ImageIcon,
    Video,
    Calendar,
    User,
    MapPin,
    Mail,
    Trophy,
    Star,
    CheckCircle,
    XCircle,
    Download,
    ExternalLink,
    Clock,
    CheckSquare,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import Image from 'next/image';

export default function SubmissionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const submissionId = params.id as string;

    const [reviewStatus, setReviewStatus] = useState<string>('null');
    const [reviewScore, setReviewScore] = useState<string>('');
    const [reviewNote, setReviewNote] = useState<string>('');

    // Fetch submission details
    const { data, isLoading, error } = useQuery({
        queryKey: ['submission', submissionId],
        queryFn: async () => {
            const response = await submissionsAPI.getById(submissionId);
            return response.data;
        },
        enabled: !!submissionId,
    });

    // Set initial values when data loads
    useEffect(() => {
        if (data) {
            setReviewStatus(data.status);
            setReviewScore(data.score?.toString() || '');
            setReviewNote(data.reviewNote || '');
        }
    }, [data]);

    // Review mutation
    const reviewMutation = useMutation({
        mutationFn: (reviewData: any) =>
            submissionsAPI.review(submissionId, reviewData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submission', submissionId] });
            queryClient.invalidateQueries({ queryKey: ['submissions'] });
            toast.success('Submission reviewed successfully!');
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || 'Failed to review submission'
            );
        },
    });

    const handleReview = () => {
        if (!reviewStatus) {
            toast.error('Please select a review status');
            return;
        }

        const maxScore = data?.task?.maxScore || 100;
        const scoreValue = reviewScore ? parseInt(reviewScore) : undefined;

        if (scoreValue !== undefined && (scoreValue < 0 || scoreValue > maxScore)) {
            toast.error(`Score must be between 0 and ${maxScore}`);
            return;
        }

        reviewMutation.mutate({
            status: reviewStatus,
            score: scoreValue,
            reviewNote: reviewNote || undefined,
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return (
                    <Badge className="bg-green-600 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                    </Badge>
                );
            case 'REJECTED':
                return (
                    <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Review
                    </Badge>
                );
        }
    };

    const getTaskTypeIcon = (type: string) => {
        switch (type) {
            case 'TEXT':
                return <FileText className="h-5 w-5" />;
            case 'IMAGE':
                return <ImageIcon className="h-5 w-5" />;
            case 'VIDEO':
                return <Video className="h-5 w-5" />;
            case 'QUIZ':
                return <Trophy className="h-5 w-5" />;
            case 'CHECKLIST':
                return <CheckSquare className="h-5 w-5" />;
            default:
                return <FileText className="h-5 w-5" />;
        }
    };

    // Render submission content based on task type
    const renderSubmissionContent = (content: any, taskType: string) => {
        if (!content)
            return (
                <p className="text-muted-foreground">No content submitted</p>
            );

        switch (taskType) {
            case 'TEXT':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span>Text Submission</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                <p className="whitespace-pre-wrap text-base leading-relaxed">
                                    {content.text || 'No text content'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 'IMAGE':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <ImageIcon className="h-4 w-4" />
                                <span>Image Submission</span>
                            </CardTitle>
                            {content.description && (
                                <CardDescription>{content.description}</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-3">
                                {content.imageCount || 0} image(s) uploaded
                            </p>
                        </CardContent>
                    </Card>
                );

            case 'VIDEO':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Video className="h-4 w-4" />
                                <span>Video Submission</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm font-medium mb-1">Video URL:</p>
                                <a
                                    href={content.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center space-x-1"
                                >
                                    <span className="break-all">{content.videoUrl}</span>
                                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                </a>
                            </div>
                            {content.platform && (
                                <div>
                                    <p className="text-sm font-medium">Platform:</p>
                                    <Badge variant="outline">{content.platform}</Badge>
                                </div>
                            )}
                            {/* Embed preview if YouTube */}
                            {content.platform === 'YouTube' && content.videoUrl && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium mb-2">Preview:</p>
                                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                        <iframe
                                            src={content.videoUrl.replace('watch?v=', 'embed/')}
                                            className="w-full h-full"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );

            case 'QUIZ':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Trophy className="h-4 w-4" />
                                <span>Quiz Answers</span>
                            </CardTitle>
                            <CardDescription>
                                {content.submittedAt ? `Submitted on ${formatDateTime(content.submittedAt)}` : 'Not yet submitted'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {content.answers && typeof content.answers === 'object' ? (
                                    Object.entries(content.answers).map(
                                        ([question, answer]: [string, any], index) => (
                                            <div
                                                key={index}
                                                className="border-l-4 border-primary/30 pl-4 py-2"
                                            >
                                                <p className="font-medium text-sm mb-1">
                                                    {index + 1}. {question}
                                                </p>
                                                <p className="text-base text-muted-foreground">
                                                    {String(answer)}
                                                </p>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <p className="text-muted-foreground">Quiz completed</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );

            case 'FORM':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span>Form Responses</span>
                            </CardTitle>
                            <CardDescription>
                                {content.submittedAt ? `Submitted on ${formatDateTime(content.submittedAt)}` : 'Not yet submitted'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {content.responses && typeof content.responses === 'object' ? (
                                    Object.entries(content.responses).map(
                                        ([field, value]: [string, any], index) => (
                                            <div
                                                key={index}
                                                className="grid grid-cols-3 gap-4 py-2 border-b last:border-b-0"
                                            >
                                                <p className="font-medium capitalize col-span-1">
                                                    {field.replace(/([A-Z])/g, ' $1').trim()}:
                                                </p>
                                                <p className="text-muted-foreground col-span-2">
                                                    {String(value)}
                                                </p>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <p className="text-muted-foreground">Form submitted</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );

            case 'PICK_ONE':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4" />
                                <span>Selected Option</span>
                            </CardTitle>
                            <CardDescription>
                                {content.submittedAt ? `Submitted on ${formatDateTime(content.submittedAt)}` : 'Not yet submitted'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="bg-primary/5 p-4 rounded-lg">
                                <p className="font-medium mb-2">Selected:</p>
                                <p className="text-base">
                                    {content.selectedOption || 'No option selected'}
                                </p>
                            </div>
                            {content.explanation && (
                                <div>
                                    <p className="font-medium mb-2">Explanation:</p>
                                    <p className="text-sm text-muted-foreground">
                                        {content.explanation}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );

            case 'CHECKLIST':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <CheckSquare className="h-4 w-4" />
                                <span>Checklist Items</span>
                            </CardTitle>
                            <CardDescription>
                                {content.submittedAt ? `Submitted on ${formatDateTime(content.submittedAt)}` : 'Not yet submitted'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {content.checkedItems && Array.isArray(content.checkedItems) ? (
                                    content.checkedItems.map((item: string, index: number) => (
                                        <div key={index} className="flex items-center space-x-3 p-2">
                                            <div className="w-5 h-5 rounded border-2 bg-green-500 border-green-500 flex items-center justify-center">
                                                <CheckCircle className="h-3 w-3 text-white" />
                                            </div>
                                            <span className="text-base">{item}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">Checklist completed</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );

            default:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Submission Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {typeof content === 'string' ? (
                                <p className="whitespace-pre-wrap">{content}</p>
                            ) : (
                                <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-4 rounded overflow-auto">
                                    {JSON.stringify(content, null, 2)}
                                </pre>
                            )}
                        </CardContent>
                    </Card>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <p className="text-red-600">Failed to load submission</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Submission Review</h1>
                        <p className="text-muted-foreground">
                            Review and score teen submission
                        </p>
                    </div>
                </div>
                {getStatusBadge(data.status)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Submission Content (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Task Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    {getTaskTypeIcon(data.task.taskType)}
                                    <div>
                                        <CardTitle>{data.task.title}</CardTitle>
                                        <CardDescription>
                                            {data.task.challenge.theme} • {data.task.tabName}
                                        </CardDescription>
                                    </div>
                                </div>
                                <Badge variant="outline">{data.task.taskType}</Badge>
                            </div>
                        </CardHeader>
                        {data.task.description && (
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {data.task.description}
                                </p>
                            </CardContent>
                        )}
                    </Card>

                    {/* Submission Content */}
                    {renderSubmissionContent(data.content, data.task.taskType)}

                    {/* File Attachments */}
                    {data.fileUrls && data.fileUrls.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <ImageIcon className="h-4 w-4" />
                                    <span>File Attachments ({data.fileUrls.length})</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data.fileUrls.map((url: string, index: number) => (
                                        <div
                                            key={index}
                                            className="border rounded-lg overflow-hidden"
                                        >
                                            {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                <div className="relative aspect-video bg-gray-100">
                                                    <Image
                                                        src={url}
                                                        alt={`Attachment ${index + 1}`}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                                    <FileText className="h-12 w-12 text-gray-400" />
                                                </div>
                                            )}
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                                                <span className="text-sm font-medium">
                                                    Attachment {index + 1}
                                                </span>
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
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Review Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Star className="h-4 w-4" />
                                <span>Review & Score</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Status */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Review Status</label>
                                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
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
                                        <SelectItem value="PENDING">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                                <span>Pending</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Score */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Score (Optional)
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    max={data.task.maxScore || 100}
                                    placeholder={`0 - ${data.task.maxScore || 100}`}
                                    value={reviewScore}
                                    onChange={(e) => setReviewScore(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Max score: {data.task.maxScore || 100} points
                                </p>
                            </div>

                            {/* Review Note */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Review Note (Optional)
                                </label>
                                <Textarea
                                    placeholder="Add feedback for the teen..."
                                    value={reviewNote}
                                    onChange={(e) => setReviewNote(e.target.value)}
                                    className="min-h-[100px]"
                                    maxLength={500}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {reviewNote.length}/500 characters
                                </p>
                            </div>

                            {/* Current Score Display */}
                            {data.score && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Current Score: {data.score}/{data.task.maxScore || 100}
                                    </p>
                                    {data.reviewNote && (
                                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                            Note: {data.reviewNote}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-2">
                                <Button
                                    className="w-full"
                                    onClick={handleReview}
                                    disabled={reviewMutation.isPending}
                                >
                                    {reviewMutation.isPending
                                        ? 'Submitting...'
                                        : 'Submit Review'}
                                </Button>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setReviewStatus('APPROVED');
                                            setTimeout(handleReview, 100);
                                        }}
                                        disabled={reviewMutation.isPending}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Quick Approve
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setReviewStatus('REJECTED');
                                            setTimeout(handleReview, 100);
                                        }}
                                        disabled={reviewMutation.isPending}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Quick Reject
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reviewer Info (if already reviewed) */}
                    {data.reviewer && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Reviewed By</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1 text-sm">
                                    <p className="font-medium">{data.reviewer.name}</p>
                                    <p className="text-muted-foreground">{data.reviewer.email}</p>
                                    {data.reviewedAt && (
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateTime(data.reviewedAt)}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Teen Info & Review Form (1/3 width) */}
                <div className="space-y-6">
                    {/* Teen Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Teen Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={data.teen.profilePhoto} />
                                    <AvatarFallback>
                                        {data.teen.name
                                            .split(' ')
                                            .map((n: string) => n[0])
                                            .join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{data.teen.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Age: {data.teen.age || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        {data.teen.email}
                                    </span>
                                </div>
                                {data.teen.state && data.teen.country && (
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            {data.teen.state}, {data.teen.country}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        Submitted: {formatDateTime(data.submittedAt)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}