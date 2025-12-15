// components/tasks/create-task-dialog.tsx
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '@/lib/api';
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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { TaskTypeSelector } from './task-type-selector';
import { TaskOptionsEditor } from './task-options-editor';

const createTaskSchema = z.object({
    challengeId: z.string().min(1, 'Challenge ID is required'),
    tabName: z.string().min(1, 'Tab name is required'),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    taskType: z.enum([
        'TEXT',
        'IMAGE',
        'VIDEO',
        'QUIZ',
        'FORM',
        'PICK_ONE',
        'CHECKLIST',
    ]),
    dueDate: z.string().optional(),
    isRequired: z.boolean(),
    completionRule: z.string(),
    maxScore: z.number().min(0).max(100),
    options: z.any().optional(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

interface CreateTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    challengeId: string;
}

const TAB_OPTIONS = [
    'Bible Study',
    'Book of the Month',
    'Activities',
    'Other',
];

/**
 * Generate unique ID for task options
 */
function generateUniqueId(prefix: string, index: number): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`;
}

/**
 * Process task options to add IDs where missing
 */
function processTaskOptions(taskType: string, options: any): any {
    if (!options) return null;

    const processedOptions = { ...options };

    switch (taskType) {
        case 'CHECKLIST':
            if (options.items && Array.isArray(options.items)) {
                processedOptions.items = options.items.map((item: any, index: number) => {
                    // Handle both string and object formats
                    if (typeof item === 'string') {
                        return {
                            id: generateUniqueId('item', index),
                            text: item,
                        };
                    }
                    return {
                        ...item,
                        id: item.id || generateUniqueId('item', index),
                        text: item.text || item.title || item.name || `Item ${index + 1}`,
                    };
                });
            }
            break;

        case 'QUIZ':
            if (options.questions && Array.isArray(options.questions)) {
                processedOptions.questions = options.questions.map((question: any, index: number) => ({
                    ...question,
                    id: question.id || generateUniqueId('question', index),
                    text: question.text || question.question || '',
                    options: question.options || [],
                }));
            }
            break;

        case 'FORM':
            if (options.fields && Array.isArray(options.fields)) {
                processedOptions.fields = options.fields.map((field: any, index: number) => ({
                    ...field,
                    id: field.id || generateUniqueId('field', index),
                    label: field.label || field.name || `Field ${index + 1}`,
                    type: field.type || 'text',
                    required: field.required !== undefined ? field.required : false,
                }));
            }
            break;

        case 'PICK_ONE':
            if (options.options && Array.isArray(options.options)) {
                processedOptions.options = options.options.map((option: any, index: number) => {
                    if (typeof option === 'string') {
                        return {
                            id: generateUniqueId('option', index),
                            title: option,
                            description: '',
                        };
                    }
                    return {
                        ...option,
                        id: option.id || generateUniqueId('option', index),
                        title: option.title || option.text || option.name || `Option ${index + 1}`,
                    };
                });
            }
            break;

        default:
            break;
    }

    return processedOptions;
}

export function CreateTaskDialog({
    open,
    onOpenChange,
    challengeId,
}: CreateTaskDialogProps) {
    const [taskOptions, setTaskOptions] = useState<any>(null);
    const queryClient = useQueryClient();

    const form = useForm<CreateTaskFormData>({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
            challengeId,
            tabName: '',
            title: '',
            description: '',
            taskType: 'TEXT',
            dueDate: '',
            isRequired: false,
            completionRule: 'Complete this task',
            maxScore: 100,
            options: null,
        },
    });

    const taskType = form.watch('taskType');

    const createMutation = useMutation({
        mutationFn: (data: CreateTaskFormData) => tasksAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] });
            queryClient.invalidateQueries({ queryKey: ['tasks', challengeId] });
            toast.success('Task created successfully!');
            onOpenChange(false);
            form.reset();
            setTaskOptions(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create task');
        },
    });

    const onSubmit: SubmitHandler<CreateTaskFormData> = (values) => {
        // Process options to add IDs
        const processedOptions = processTaskOptions(values.taskType, taskOptions);

        const submitData = {
            ...values,
            options: processedOptions,
            dueDate: values.dueDate || undefined,
        };

        console.log('📤 Submitting task with processed options:', {
            taskType: values.taskType,
            originalOptions: taskOptions,
            processedOptions,
        });

        createMutation.mutate(submitData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                        Add a new task to this challenge. IDs will be automatically generated for task options.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="px-6 py-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Basic Information</h3>

                                    <FormField
                                        control={form.control}
                                        name="tabName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tab Category</FormLabel>
                                                <FormControl>
                                                    <select
                                                        {...field}
                                                        className="w-full px-3 py-2 border rounded-md bg-background"
                                                    >
                                                        <option value="">Select a tab...</option>
                                                        {TAB_OPTIONS.map((tab) => (
                                                            <option key={tab} value={tab}>
                                                                {tab}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Task Title</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Read Chapter 1: Faith Foundations"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Provide detailed instructions for this task..."
                                                        className="min-h-[120px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="taskType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <TaskTypeSelector
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Task Options based on type */}
                                <div className="space-y-4">
                                    <TaskOptionsEditor
                                        taskType={taskType}
                                        options={taskOptions}
                                        onChange={setTaskOptions}
                                    />

                                    {/* Show info about ID generation */}
                                    {['CHECKLIST', 'QUIZ', 'FORM', 'PICK_ONE'].includes(taskType) && (
                                        <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                                            <p className="flex items-center gap-2">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    strokeWidth="2"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                <span className="font-medium">Unique IDs will be automatically generated</span>
                                            </p>
                                            <p className="mt-1 ml-6 text-xs">
                                                Each {taskType === 'CHECKLIST' ? 'checklist item' :
                                                    taskType === 'QUIZ' ? 'quiz question' :
                                                        taskType === 'FORM' ? 'form field' : 'option'} will receive a unique identifier for proper tracking.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Additional Settings */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Additional Settings</h3>

                                    <FormField
                                        control={form.control}
                                        name="completionRule"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Completion Rule</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Complete any 1 of these 3 options"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Explain how this task should be completed
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="dueDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Due Date (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input type="datetime-local" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="maxScore"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Max Score</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="100"
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
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="isRequired"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Required Task</FormLabel>
                                                    <FormDescription>
                                                        Mark this task as required for challenge completion
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
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
                                setTaskOptions(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            onClick={form.handleSubmit(onSubmit)}
                        >
                            {createMutation.isPending ? 'Creating...' : 'Create Task'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}