// components/tasks/create-task-form.tsx
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { tasksAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { TaskTypeSelector } from './task-type-selector';
import { TaskOptionsEditor } from './task-options-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const createTaskSchema = z.object({
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

interface CreateTaskFormProps {
    challengeId: string;
    onTaskCreated: (task: any) => void;
}

const TAB_OPTIONS = [
    'Bible Study',
    'Book of the Month',
    'Projects',
    'Other',
];

function generateUniqueId(prefix: string, index: number): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`;
}

function processTaskOptions(taskType: string, options: any): any {
    if (!options) return null;

    const processedOptions = { ...options };

    switch (taskType) {
        case 'CHECKLIST':
            if (options.items && Array.isArray(options.items)) {
                processedOptions.items = options.items.map((item: any, index: number) => {
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

export function CreateTaskForm({ challengeId, onTaskCreated }: CreateTaskFormProps) {
    const [taskOptions, setTaskOptions] = useState<any>(null);

    const form = useForm<CreateTaskFormData>({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
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
        mutationFn: (data: any) => tasksAPI.create(data),
        onSuccess: (response) => {
            onTaskCreated(response.data);
            form.reset();
            setTaskOptions(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create task');
        },
    });

    const onSubmit: SubmitHandler<CreateTaskFormData> = (values) => {
        const processedOptions = processTaskOptions(values.taskType, taskOptions);

        const submitData = {
            ...values,
            challengeId,
            options: processedOptions,
            dueDate: values.dueDate || undefined,
        };

        createMutation.mutate(submitData);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Task</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="tabName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tab Category *</FormLabel>
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
                                    <FormLabel>Task Title *</FormLabel>
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
                                    <FormLabel>Description *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Provide detailed instructions for this task..."
                                            className="min-h-[80px]"
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

                        <TaskOptionsEditor
                            taskType={taskType}
                            options={taskOptions}
                            onChange={setTaskOptions}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="maxScore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Score *</FormLabel>
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

                            <FormField
                                control={form.control}
                                name="isRequired"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 pt-8">
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="!mt-0">Required Task</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="w-full"
                        >
                            {createMutation.isPending ? 'Adding Task...' : 'Add Task'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}