// components/analytics/progress-distribution.tsx
'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface ProgressDistributionProps {
  challenges: any[];
}

export function ProgressDistribution({
  challenges,
}: ProgressDistributionProps) {
  const aggregatedDistribution = challenges.reduce(
    (acc, challenge) => {
      const dist = challenge.stats.progressDistribution;
      return {
        '0-25': acc['0-25'] + (dist['0-25'] || 0),
        '25-50': acc['25-50'] + (dist['25-50'] || 0),
        '50-75': acc['50-75'] + (dist['50-75'] || 0),
        '75-99': acc['75-99'] + (dist['75-99'] || 0),
        '100': acc['100'] + (dist['100'] || 0),
      };
    },
    { '0-25': 0, '25-50': 0, '50-75': 0, '75-99': 0, '100': 0 }
  );

  const data = [
    { name: '0-25%', value: aggregatedDistribution['0-25'], color: '#ef4444' },
    {
      name: '25-50%',
      value: aggregatedDistribution['25-50'],
      color: '#f97316',
    },
    {
      name: '50-75%',
      value: aggregatedDistribution['50-75'],
      color: '#eab308',
    },
    {
      name: '75-99%',
      value: aggregatedDistribution['75-99'],
      color: '#22c55e',
    },
    { name: '100%', value: aggregatedDistribution['100'], color: '#059669' },
  ].filter((item) => item.value > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
