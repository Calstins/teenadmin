// app/dashboard/teens/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { teensAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Eye, Users } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';

export default function TeensPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [ageFilter, setAgeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['teens', searchTerm, ageFilter],
    queryFn: () =>
      teensAPI.getAll({
        search: searchTerm || undefined,
        minAge: ageFilter ? parseInt(ageFilter) : undefined,
      }),
  });

  const teens = data?.data?.teens || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Teens</h2>
          <p className="text-muted-foreground">View and manage teen accounts</p>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Input
          type="number"
          placeholder="Min age"
          value={ageFilter}
          onChange={(e) => setAgeFilter(e.target.value)}
          className="w-24"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading teens...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teens.map((teen: any) => (
            <Card key={teen.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={teen.profilePhoto} />
                    <AvatarFallback>
                      {teen.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{teen.name}</CardTitle>
                    <CardDescription>{teen.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Age:</span>
                    <span className="font-medium">{teen.age}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Location:
                    </span>
                    <span className="font-medium">
                      {teen.state}, {teen.country}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Submissions:
                    </span>
                    <span className="font-medium">
                      {teen._count.submissions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Badges:
                    </span>
                    <span className="font-medium">{teen._count.badges}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Status:
                    </span>
                    <Badge variant={teen.isActive ? 'default' : 'secondary'}>
                      {teen.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Joined: {formatDateTime(teen.createdAt)}
                  </div>

                  <div className="pt-2">
                    <Link href={`/dashboard/teens/${teen.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-2 h-3 w-3" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {teens.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No teens found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No teens match your current filters.
          </p>
        </div>
      )}
    </div>
  );
}
