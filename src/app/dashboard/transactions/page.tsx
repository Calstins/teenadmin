// app/dashboard/transactions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionsAPI } from '@/lib/api';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DollarSign,
    TrendingUp,
    CreditCard,
    Users,
    Search,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export default function TransactionsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [mounted, setMounted] = useState(false);

    // Fix hydration error by only rendering after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch revenue summary
    const { data: revenueSummary } = useQuery({
        queryKey: ['revenue-summary'],
        queryFn: () => transactionsAPI.getRevenueSummary(),
        enabled: mounted, // Only fetch after mount
    });

    // Fetch analytics
    const { data: analytics } = useQuery({
        queryKey: ['transaction-analytics'],
        queryFn: () => transactionsAPI.getAnalytics(),
        enabled: mounted,
    });

    // Fetch transactions
    const { data: transactionsData, isLoading } = useQuery({
        queryKey: [
            'transactions',
            searchTerm,
            statusFilter,
            paymentMethodFilter,
            currentPage,
        ],
        queryFn: () =>
            transactionsAPI.getAll({
                search: searchTerm || undefined,
                status: statusFilter || undefined,
                paymentMethod: paymentMethodFilter || undefined,
                page: currentPage,
                limit: 20,
            }),
        enabled: mounted,
    });

    const transactions = transactionsData?.data?.transactions || [];
    const pagination = transactionsData?.data?.pagination || {};
    const revenue = revenueSummary?.data || {};
    const analyticsData = analytics?.data || {};

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return <Badge className="bg-green-600">Success</Badge>;
            case 'FAILED':
                return <Badge variant="destructive">Failed</Badge>;
            case 'PENDING':
                return <Badge variant="outline">Pending</Badge>;
            case 'CANCELLED':
                return <Badge variant="secondary">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatCurrency = (amount: number) => {
        if (!mounted) return '₦0.00'; // Return static value during SSR
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(amount || 0);
    };

    const formatPercentage = (value: any) => {
        if (!mounted) return '0.0%'; // Return static value during SSR
        const num = parseFloat(value) || 0;
        return num > 0 ? `+${num.toFixed(1)}%` : `${num.toFixed(1)}%`;
    };

    // Show loading state during SSR and initial mount
    if (!mounted) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
                    <p className="text-muted-foreground">
                        Monitor and manage all badge purchase transactions
                    </p>
                </div>
                <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                </Button>
            </div>

            {/* Revenue Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(revenue.thisMonth?.revenue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            {(revenue.thisMonth?.growth || 0) >= 0 ? (
                                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                            ) : (
                                <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                            )}
                            <span
                                className={
                                    (revenue.thisMonth?.growth || 0) >= 0
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }
                            >
                                {formatPercentage(revenue.thisMonth?.growth || 0)}
                            </span>
                            <span className="ml-1">from last month</span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Year</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(revenue.thisYear?.revenue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {revenue.thisYear?.transactions || 0} transactions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">All Time</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(revenue.allTime?.revenue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {revenue.allTime?.transactions || 0} total transactions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(analyticsData.overview?.averageTransaction || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            per badge purchase
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Spenders Card */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Top Spenders</CardTitle>
                        <CardDescription>Teens with highest badge purchases</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analyticsData.topSpenders && analyticsData.topSpenders.length > 0 ? (
                                analyticsData.topSpenders.slice(0, 5).map((spender: any, index: number) => (
                                    <div key={spender.teen?.id || index} className="flex items-center">
                                        <div className="flex items-center space-x-3 flex-1">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm font-bold text-purple-700 dark:text-purple-300">
                                                #{index + 1}
                                            </div>
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>
                                                    {spender.teen?.name
                                                        .split(' ')
                                                        .map((n: string) => n[0])
                                                        .join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {spender.teen?.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {spender.transactionCount} transactions
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold text-green-600">
                                            {formatCurrency(spender.totalSpent || 0)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No data available yet
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>Transaction breakdown by payment type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analyticsData.paymentMethodBreakdown && analyticsData.paymentMethodBreakdown.length > 0 ? (
                                analyticsData.paymentMethodBreakdown.map((method: any) => (
                                    <div key={method.method} className="flex items-center">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-medium capitalize">
                                                    {method.method || 'Unknown'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {method.count} transactions
                                                </p>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-purple-600 h-2 rounded-full"
                                                    style={{
                                                        width: `${Math.min(100, (method.count /
                                                            (analyticsData.overview?.totalTransactions || 1)) *
                                                            100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="ml-4 text-sm font-bold">
                                            {formatCurrency(method.amount || 0)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No data available yet
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Transaction History</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Filters</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by teen name or email..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-8"
                            />
                        </div>

                        <Select
                            value={statusFilter}
                            onValueChange={(value) => {
                                setStatusFilter(value);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="SUCCESS">Success</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="FAILED">Failed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={paymentMethodFilter}
                            onValueChange={(value) => {
                                setPaymentMethodFilter(value);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Methods" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Methods</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                <SelectItem value="ussd">USSD</SelectItem>
                                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Teen</TableHead>
                                <TableHead>Badge</TableHead>
                                <TableHead>Challenge</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Reference</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                        <p className="mt-2 text-muted-foreground">
                                            Loading transactions...
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        <p className="text-muted-foreground">
                                            No transactions found
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((transaction: any) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>
                                                        {transaction.teen?.name
                                                            .split(' ')
                                                            .map((n: string) => n[0])
                                                            .join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <Link
                                                        href={`/dashboard/teens/${transaction.teen?.id}`}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {transaction.teen?.name}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground">
                                                        {transaction.teen?.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium">{transaction.badge?.name}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {transaction.badge?.challenge?.theme}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {
                                                        MONTHS[
                                                        (transaction.badge?.challenge?.month || 1) - 1
                                                        ]
                                                    }{' '}
                                                    {transaction.badge?.challenge?.year}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold text-green-600">
                                            {formatCurrency(transaction.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <span className="capitalize text-sm">
                                                {transaction.paymentMethod?.replace('_', ' ') || 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                                        <TableCell className="text-sm">
                                            {transaction.paidAt
                                                ? formatDateTime(transaction.paidAt)
                                                : formatDateTime(transaction.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                {transaction.reference?.substring(0, 12)}...
                                            </code>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} transactions
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                                let page;
                                if (pagination.pages <= 5) {
                                    page = i + 1;
                                } else if (currentPage <= 3) {
                                    page = i + 1;
                                } else if (currentPage >= pagination.pages - 2) {
                                    page = pagination.pages - 4 + i;
                                } else {
                                    page = currentPage - 2 + i;
                                }
                                return (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className="w-8 h-8 p-0"
                                    >
                                        {page}
                                    </Button>
                                );
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setCurrentPage((prev) => Math.min(pagination.pages, prev + 1))
                            }
                            disabled={currentPage === pagination.pages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}