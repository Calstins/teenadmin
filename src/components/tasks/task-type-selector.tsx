// components/tasks/task-type-selector.tsx
'use client';

import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const TASK_TYPES = [
    { value: 'TEXT', label: '📝 Text Response', icon: '📝' },
    { value: 'IMAGE', label: '🖼️ Image Upload', icon: '🖼️' },
    { value: 'VIDEO', label: '🎥 Video URL', icon: '🎥' },
    { value: 'QUIZ', label: '❓ Quiz', icon: '❓' },
    { value: 'FORM', label: '📋 Form', icon: '📋' },
    { value: 'PICK_ONE', label: '🎯 Pick One', icon: '🎯' },
    { value: 'CHECKLIST', label: '✅ Checklist', icon: '✅' },
];

interface TaskTypeSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export function TaskTypeSelector({ value, onChange }: TaskTypeSelectorProps) {
    return (
        <div className="space-y-2">
            <Label>Task Type</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                    {TASK_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                                <span>{type.icon}</span>
                                <span>{type.label}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}