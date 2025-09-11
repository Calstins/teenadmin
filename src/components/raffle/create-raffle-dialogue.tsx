// components/raffle/create-raffle-dialog.tsx
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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

const raffleSchema = z.object({
  year: z.number().min(2020).max(2030),
  prize: z.string().min(3, 'Prize must be at least 3 characters'),
  description: z.string().optional(),
});

type RaffleFormData = z.infer<typeof raffleSchema>;

interface CreateRaffleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  eligibleCount: number;
  onSubmit: (data: RaffleFormData) => void;
  isLoading: boolean;
}

export function CreateRaffleDialog({
  open,
  onOpenChange,
  year,
  eligibleCount,
  onSubmit,
  isLoading,
}: CreateRaffleDialogProps) {
  const form = useForm<RaffleFormData>({
    resolver: zodResolver(raffleSchema),
    defaultValues: {
      year,
      prize: '',
      description: '',
    },
  });

  const handleSubmit: SubmitHandler<RaffleFormData> = (data) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Raffle Draw</DialogTitle>
          <DialogDescription>
            Create a raffle draw for {year} with {eligibleCount} eligible teens
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input type="number" disabled {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prize</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., $500 Gift Card, iPad Pro, etc."
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about the prize..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ This will randomly select a winner from {eligibleCount}{' '}
                eligible teens. This action cannot be undone.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || eligibleCount === 0}>
                {isLoading ? 'Creating Draw...' : 'Create & Draw Winner'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
