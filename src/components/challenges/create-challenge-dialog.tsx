'use client';

import { useState } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
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
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const taskSchema = z.object({
  tabName: z.enum([
    'Bible Study',
    'Book of the Month',
    'Activities',
    'Projects',
  ]),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
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
  maxScore: z.number().min(1).max(100),
});

const challengeSchema = z.object({
  year: z.number().min(2020).max(2030),
  month: z.number().min(1).max(12),
  theme: z.string().min(3, 'Theme must be at least 3 characters'),
  instructions: z
    .string()
    .min(10, 'Instructions must be at least 10 characters'),
  goLiveDate: z.string(),
  closingDate: z.string(),
  badge: z.object({
    name: z.string().min(1, 'Badge name is required'),
    description: z.string().min(1, 'Badge description is required'),
    imageUrl: z.string().url('Must be a valid URL'),
    price: z.number().min(0, 'Price must be positive'),
  }),
  tasks: z.array(taskSchema).min(1, 'At least one task is required'),
});

type ChallengeFormData = z.infer<typeof challengeSchema>;

interface CreateChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChallengeDialog({
  open,
  onOpenChange,
}: CreateChallengeDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const queryClient = useQueryClient();

  const form = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      theme: '',
      instructions: '',
      goLiveDate: '',
      closingDate: '',
      badge: {
        name: '',
        description: '',
        imageUrl: '',
        price: 0,
      },
      tasks: [
        {
          tabName: 'Activities' as const,
          title: '',
          description: '',
          taskType: 'TEXT' as const,
          isRequired: false,
          completionRule: 'Complete this task',
          maxScore: 100,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tasks',
  });

  const createMutation = useMutation({
    mutationFn: challengesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Challenge created successfully!');
      onOpenChange(false);
      form.reset();
      setCurrentStep(1);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to create challenge'
      );
    },
  });

  const onSubmit: SubmitHandler<ChallengeFormData> = (values) => {
    createMutation.mutate(values);
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof ChallengeFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = [
        'year',
        'month',
        'theme',
        'instructions',
        'goLiveDate',
        'closingDate',
      ];
    } else if (currentStep === 2) {
      fieldsToValidate = ['badge'];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Challenge</DialogTitle>
          <DialogDescription>
            Step {currentStep} of 3:{' '}
            {currentStep === 1
              ? 'Basic Information'
              : currentStep === 2
              ? 'Badge Details'
              : 'Tasks'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                        <FormLabel>Month</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem
                                key={i + 1}
                                value={(i + 1).toString()}
                              >
                                {new Date(0, i).toLocaleDateString('en-US', {
                                  month: 'long',
                                })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      <FormLabel>Theme</FormLabel>
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
                      <FormLabel>Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what teens should expect this month..."
                          className="min-h-[100px]"
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
                        <FormLabel>Go Live Date</FormLabel>
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
                        <FormLabel>Closing Date</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Badge</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="badge.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Badge Name</FormLabel>
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
                      name="badge.description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Badge Description</FormLabel>
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
                      name="badge.imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Badge Image URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/badge.png"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="badge.price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Badge Price (₦)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="9.99"
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
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Tasks</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        tabName: 'Activities' as const,
                        title: '',
                        description: '',
                        taskType: 'TEXT' as const,
                        isRequired: false,
                        completionRule: 'Complete this task',
                        maxScore: 100,
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {fields.map((field, index) => (
                    <Card key={field.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            Task {index + 1}
                          </CardTitle>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name={`tasks.${index}.tabName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tab</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Bible Study">
                                      Bible Study
                                    </SelectItem>
                                    <SelectItem value="Book of the Month">
                                      Book of the Month
                                    </SelectItem>
                                    <SelectItem value="Activities">
                                      Activities
                                    </SelectItem>
                                    <SelectItem value="Projects">
                                      Projects
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`tasks.${index}.taskType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="TEXT">Text</SelectItem>
                                    <SelectItem value="IMAGE">Image</SelectItem>
                                    <SelectItem value="VIDEO">Video</SelectItem>
                                    <SelectItem value="QUIZ">Quiz</SelectItem>
                                    <SelectItem value="FORM">Form</SelectItem>
                                    <SelectItem value="PICK_ONE">
                                      Pick One
                                    </SelectItem>
                                    <SelectItem value="CHECKLIST">
                                      Checklist
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`tasks.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Task title..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`tasks.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Task instructions..."
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <div className="flex justify-between w-full">
                <div>
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Previous
                    </Button>
                  )}
                </div>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  {currentStep < 3 ? (
                    <Button type="button" onClick={nextStep}>
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending
                        ? 'Creating...'
                        : 'Create Challenge'}
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
