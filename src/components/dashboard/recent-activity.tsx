import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDateTime } from '@/lib/utils';

interface RecentActivityProps {
  submissions: any[];
  challenges: any[];
}

export function RecentActivity({
  submissions,
  challenges,
}: RecentActivityProps) {
  const activities = [
    ...(submissions || []).map((sub) => ({
      type: 'submission',
      user: sub.teen.name,
      action: `submitted ${sub.task.title}`,
      time: sub.submittedAt,
      status: sub.status,
    })),
    ...(challenges || []).map((challenge) => ({
      type: 'challenge',
      user: challenge.createdBy.name,
      action: `created ${challenge.theme}`,
      time: challenge.createdAt,
      status: challenge.isPublished ? 'published' : 'draft',
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {activity.user
                .split(' ')
                .map((n: any) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-sm font-medium leading-none">{activity.user}</p>
            <p className="text-sm text-muted-foreground truncate">
              {activity.action}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(activity.time)}
            </p>
          </div>
          <div
            className={`text-xs px-2 py-1 rounded-full ${
              activity.status === 'APPROVED' || activity.status === 'published'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : activity.status === 'PENDING' || activity.status === 'draft'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}
          >
            {activity.status}
          </div>
        </div>
      ))}
    </div>
  );
}
