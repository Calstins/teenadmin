// components/tasks/task-options-editor.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface TaskOptionsEditorProps {
    taskType: string;
    options: any;
    onChange: (options: any) => void;
}

export function TaskOptionsEditor({
    taskType,
    options,
    onChange,
}: TaskOptionsEditorProps) {
    if (!taskType || taskType === 'TEXT' || taskType === 'IMAGE') {
        return null;
    }

    const renderQuizEditor = () => {
        const questions = options?.questions || [];

        const addQuestion = () => {
            const newQuestions = [
                ...questions,
                {
                    id: `q${questions.length + 1}`,
                    question: '',
                    type: 'multiple_choice',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                },
            ];
            onChange({ ...options, questions: newQuestions });
        };

        const updateQuestion = (index: number, field: string, value: any) => {
            const newQuestions = [...questions];
            newQuestions[index] = { ...newQuestions[index], [field]: value };
            onChange({ ...options, questions: newQuestions });
        };

        const removeQuestion = (index: number) => {
            const newQuestions = questions.filter((_: any, i: number) => i !== index);
            onChange({ ...options, questions: newQuestions });
        };

        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>Quiz Questions</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                    </Button>
                </div>

                {questions.map((q: any, index: number) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-sm">Question {index + 1}</CardTitle>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeQuestion(index)}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Label>Question Text</Label>
                                <Textarea
                                    value={q.question}
                                    onChange={(e) =>
                                        updateQuestion(index, 'question', e.target.value)
                                    }
                                    placeholder="Enter question..."
                                />
                            </div>

                            <div>
                                <Label>Question Type</Label>
                                <select
                                    value={q.type}
                                    onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                >
                                    <option value="multiple_choice">Multiple Choice</option>
                                    <option value="text">Text Response</option>
                                </select>
                            </div>

                            {q.type === 'multiple_choice' && (
                                <div className="space-y-2">
                                    <Label>Answer Options</Label>
                                    {q.options.map((opt: string, optIndex: number) => (
                                        <div key={optIndex} className="flex items-center space-x-2">
                                            <Input
                                                value={opt}
                                                onChange={(e) => {
                                                    const newOptions = [...q.options];
                                                    newOptions[optIndex] = e.target.value;
                                                    updateQuestion(index, 'options', newOptions);
                                                }}
                                                placeholder={`Option ${optIndex + 1}`}
                                            />
                                            <Switch
                                                checked={q.correctAnswer === optIndex}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        updateQuestion(index, 'correctAnswer', optIndex);
                                                    }
                                                }}
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                Correct
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    const renderFormEditor = () => {
        const fields = options?.fields || [];

        const addField = () => {
            const newFields = [
                ...fields,
                {
                    id: `field${fields.length + 1}`,
                    label: '',
                    type: 'text',
                    required: false,
                },
            ];
            onChange({ ...options, fields: newFields });
        };

        const updateField = (index: number, field: string, value: any) => {
            const newFields = [...fields];
            newFields[index] = { ...newFields[index], [field]: value };
            onChange({ ...options, fields: newFields });
        };

        const removeField = (index: number) => {
            const newFields = fields.filter((_: any, i: number) => i !== index);
            onChange({ ...options, fields: newFields });
        };

        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>Form Fields</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addField}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                    </Button>
                </div>

                {fields.map((field: any, index: number) => (
                    <Card key={index}>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <Label>Field {index + 1}</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeField(index)}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>

                            <Input
                                value={field.label}
                                onChange={(e) => updateField(index, 'label', e.target.value)}
                                placeholder="Field label"
                            />

                            <select
                                value={field.type}
                                onChange={(e) => updateField(index, 'type', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="text">Text</option>
                                <option value="textarea">Textarea</option>
                                <option value="number">Number</option>
                                <option value="select">Select</option>
                            </select>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={field.required}
                                    onCheckedChange={(checked) =>
                                        updateField(index, 'required', checked)
                                    }
                                />
                                <Label>Required</Label>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    const renderPickOneEditor = () => {
        const pickOptions = options?.options || [];

        const addOption = () => {
            const newOptions = [
                ...pickOptions,
                {
                    id: `opt${pickOptions.length + 1}`,
                    value: '',
                    label: '',
                    description: '',
                },
            ];
            onChange({ ...options, options: newOptions });
        };

        const updateOption = (index: number, field: string, value: any) => {
            const newOptions = [...pickOptions];
            newOptions[index] = { ...newOptions[index], [field]: value };
            onChange({ ...options, options: newOptions });
        };

        const removeOption = (index: number) => {
            const newOptions = pickOptions.filter((_: any, i: number) => i !== index);
            onChange({ ...options, options: newOptions });
        };

        return (
            <div className="space-y-4">
                <div>
                    <Label>Instructions</Label>
                    <Textarea
                        value={options?.instructions || ''}
                        onChange={(e) =>
                            onChange({ ...options, instructions: e.target.value })
                        }
                        placeholder="e.g., Choose one activity to complete this week"
                    />
                </div>

                <div className="flex justify-between items-center">
                    <Label>Options</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addOption}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                    </Button>
                </div>

                {pickOptions.map((opt: any, index: number) => (
                    <Card key={index}>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <Label>Option {index + 1}</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(index)}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>

                            <Input
                                value={opt.label}
                                onChange={(e) => updateOption(index, 'label', e.target.value)}
                                placeholder="Option label"
                            />

                            <Textarea
                                value={opt.description}
                                onChange={(e) =>
                                    updateOption(index, 'description', e.target.value)
                                }
                                placeholder="Option description"
                                className="min-h-[60px]"
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    const renderChecklistEditor = () => {
        const items = options?.items || [];

        const addItem = () => {
            const newItems = [
                ...items,
                {
                    id: `item${items.length + 1}`,
                    text: '',
                    required: false,
                },
            ];
            onChange({ ...options, items: newItems });
        };

        const updateItem = (index: number, field: string, value: any) => {
            const newItems = [...items];
            newItems[index] = { ...newItems[index], [field]: value };
            onChange({ ...options, items: newItems });
        };

        const removeItem = (index: number) => {
            const newItems = items.filter((_: any, i: number) => i !== index);
            onChange({ ...options, items: newItems });
        };

        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>Checklist Items</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                    </Button>
                </div>

                {items.map((item: any, index: number) => (
                    <Card key={index}>
                        <CardContent className="pt-4">
                            <div className="flex items-start space-x-2">
                                <div className="flex-1 space-y-2">
                                    <Input
                                        value={item.text}
                                        onChange={(e) => updateItem(index, 'text', e.target.value)}
                                        placeholder="Checklist item text"
                                    />
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={item.required}
                                            onCheckedChange={(checked) =>
                                                updateItem(index, 'required', checked)
                                            }
                                        />
                                        <Label className="text-xs">Required</Label>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(index)}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <div>
                    <Label>Minimum Required Items</Label>
                    <Input
                        type="number"
                        min="0"
                        max={items.length}
                        value={options?.minRequired || 0}
                        onChange={(e) =>
                            onChange({ ...options, minRequired: parseInt(e.target.value) })
                        }
                    />
                </div>
            </div>
        );
    };

    switch (taskType) {
        case 'QUIZ':
            return renderQuizEditor();
        case 'FORM':
            return renderFormEditor();
        case 'PICK_ONE':
            return renderPickOneEditor();
        case 'CHECKLIST':
            return renderChecklistEditor();
        default:
            return null;
    }
}