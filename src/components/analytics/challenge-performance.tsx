// components/analytics/challenge-performance.tsx
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ChallengePerformanceProps {
  challenges: any[];
}

export function ChallengePerformance({
  challenges,
}: ChallengePerformanceProps) {
  const sortedChallenges = [...challenges].sort(
    (a, b) => b.stats.completionRate - a.stats.completionRate
  );

  return (
    <div className="space-y-4">
      {sortedChallenges.map((challenge, index) => (
        <div key={challenge.challenge.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium">{challenge.challenge.theme}</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(0, challenge.challenge.month - 1).toLocaleDateString(
                  'en-US',
                  { month: 'long' }
                )}{' '}
                {challenge.challenge.year}
              </p>
            </div>
            <Badge variant={index < 3 ? 'default' : 'outline'}>
              #{index + 1}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Rate:</span>
              <span className="font-medium">
                {challenge.stats.completionRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={challenge.stats.completionRate} className="h-2" />

            <div className="grid grid-cols-2 gap-4 text-sm mt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Participants:</span>
                <span className="font-medium">
                  {challenge.stats.totalParticipants}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium">
                  {challenge.stats.completedCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Progress:</span>
                <span className="font-medium">
                  {challenge.stats.averageProgress.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tasks:</span>
                <span className="font-medium">
                  {challenge.challenge.totalTasks}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
