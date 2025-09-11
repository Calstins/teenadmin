'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface OverviewProps {
  data: any[] | undefined;
}

export function Overview({ data }: OverviewProps) {
  // Ensure data is an array before using map
  const dataArray = Array.isArray(data) ? data : [];

  const chartData = dataArray.map((challenge) => ({
    name: `${challenge.challenge?.theme?.substring(0, 10) || 'Unknown'}...`,
    month: challenge.challenge?.month || 0,
    participants: challenge.stats?.totalParticipants || 0,
    completed: challenge.stats?.completedCount || 0,
    completion_rate: challenge.stats?.completionRate || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-2">
                    <div className="font-medium">{label}</div>
                    <div className="grid gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">
                          Participants:
                        </span>
                        <span className="font-medium">
                          {payload[0]?.value || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">
                          Completed:
                        </span>
                        <span className="font-medium">
                          {payload[1]?.value || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar
          dataKey="participants"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
        <Bar
          dataKey="completed"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-muted"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
// ₦
