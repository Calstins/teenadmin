// components/tasks/tasks-list.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, GripVertical, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { EditTaskDialog } from './edit-task-dialog';
import { formatDateTime } from '@/lib/utils';

interface TasksListProps {
    tasks: any[];
    challengeId: string;
}

export function TasksList({ tasks, challengeId }: TasksListProps) {
    const [editingTask, setEditingTask] = useState<any>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: tasksAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] });
            queryClient.invalidateQueries({ queryKey: ['tasks', challengeId] });
            toast.success('Task deleted successfully!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete task');
        },
    });

    const handleEdit = (task: any) => {
        setEditingTask(task);
        setEditDialogOpen(true);
    };

    const getTaskTypeIcon = (type: string) => {
        switch (type) {
            case 'TEXT':
                return '📝';
            case 'IMAGE':
                return '🖼️';
            case 'VIDEO':
                return '🎥';
            case 'QUIZ':
                return '❓';
            case 'FORM':
                return '📋';
            case 'PICK_ONE':
                return '🎯';
            case 'CHECKLIST':
                return '✅';
            default:
                return '📄';
        }
    };

    // Group tasks by tab
    const tasksByTab = tasks.reduce((acc: any, task: any) => {
        if (!acc[task.tabName]) {
            acc[task.tabName] = [];
        }
        acc[task.tabName].push(task);
        return acc;
    }, {});

    if (tasks.length === 0) {
        return (
            <div className="text-center py-8 border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">No tasks yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Click &quot;Add Task&quot; to create your first task
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {Object.entries(tasksByTab).map(([tabName, tabTasks]: [string, any]) => (
                    <div key={tabName}>
                        <div className="flex items-center space-x-2 mb-3">
                            <h4 className="font-semibold text-lg">{tabName}</h4>
                            <Badge variant="secondary">{tabTasks.length}</Badge>
                        </div>

                        <div className="space-y-2">
                            {tabTasks.map((task: any) => (
                                <Card key={task.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3 flex-1">
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-xl">{getTaskTypeIcon(task.taskType)}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <CardTitle className="text-base flex items-center space-x-2">
                                                        <span>{task.title}</span>
                                                        {task.isRequired && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                Required
                                                            </Badge>
                                                        )}
                                                    </CardTitle>
                                                    <CardDescription className="mt-1">
                                                        {task.description}
                                                    </CardDescription>
                                                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                                        <span className="flex items-center space-x-1">
                                                            <span className="font-medium">Type:</span>
                                                            <span>{task.taskType}</span>
                                                        </span>
                                                        <span className="flex items-center space-x-1">
                                                            <span className="font-medium">Max Score:</span>
                                                            <span>{task.maxScore}</span>
                                                        </span>
                                                        {task.dueDate && (
                                                            <span className="flex items-center space-x-1">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>{formatDateTime(task.dueDate)}</span>
                                                            </span>
                                                        )}
                                                        {task._count?.submissions !== undefined && (
                                                            <span className="flex items-center space-x-1">
                                                                <span className="font-medium">Submissions:</span>
                                                                <span>{task._count.submissions}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(task)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete &quot;{task.title}&quot;? This
                                                                action cannot be undone and will also delete all
                                                                submissions for this task.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => deleteMutation.mutate(task.id)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    {task.completionRule && (
                                        <CardContent className="pt-0">
                                            <p className="text-xs text-muted-foreground italic">
                                                {task.completionRule}
                                            </p>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <EditTaskDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                task={editingTask}
                challengeId={challengeId}
            />
        </>
    );
}