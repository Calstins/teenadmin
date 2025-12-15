// components/tasks/edit-task-dialog.tsx
'use client';

import { useEffect, useState } from 'react';
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

const editTaskSchema = z.object({
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

type EditTaskFormData = z.infer<typeof editTaskSchema>;

interface EditTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: any;
    challengeId: string;
}

const TAB_OPTIONS = [
    'Bible Study',
    'Book of the Month',
    'Projects',
    'Other',
];

export function EditTaskDialog({
    open,
    onOpenChange,
    task,
    challengeId,
}: EditTaskDialogProps) {
    const [taskOptions, setTaskOptions] = useState<any>(null);
    const queryClient = useQueryClient();

    const form = useForm<EditTaskFormData>({
        resolver: zodResolver(editTaskSchema),
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

    // Reset form when task changes
    useEffect(() => {
        if (task) {
            form.reset({
                tabName: task.tabName,
                title: task.title,
                description: task.description,
                taskType: task.taskType,
                dueDate: task.dueDate
                    ? new Date(task.dueDate).toISOString().slice(0, 16)
                    : '',
                isRequired: task.isRequired,
                completionRule: task.completionRule,
                maxScore: task.maxScore,
            });
            setTaskOptions(task.options);
        }
    }, [task, form]);

    const updateMutation = useMutation({
        mutationFn: (data: EditTaskFormData) => tasksAPI.update(task.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] });
            queryClient.invalidateQueries({ queryKey: ['tasks', challengeId] });
            toast.success('Task updated successfully!');
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update task');
        },
    });

    const onSubmit: SubmitHandler<EditTaskFormData> = (values) => {
        const submitData = {
            ...values,
            options: taskOptions,
            dueDate: values.dueDate || undefined,
        };

        updateMutation.mutate(submitData);
    };

    if (!task) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>Update task details</DialogDescription>
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
                                                <FormDescription>
                                                    Changing task type will reset options
                                                </FormDescription>
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
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                            onClick={form.handleSubmit(onSubmit)}
                        >
                            {updateMutation.isPending ? 'Updating...' : 'Update Task'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}