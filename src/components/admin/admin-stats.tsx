'use client';

import { Clock, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import type { Reservation } from '@/types/Reservation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminStatsProps {
    reservations: Reservation[];
    isLoading: boolean;
}

export default function AdminStats({
    reservations,
    isLoading,
}: AdminStatsProps) {
    if (isLoading) {
        return (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <Skeleton className='h-4 w-20' />
                            <Skeleton className='h-4 w-4' />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className='mb-1 h-8 w-16' />
                            <Skeleton className='h-3 w-24' />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const totalReservations = reservations.length;
    const pendingCount = reservations.filter(
        res => res.status === 'PENDING',
    ).length;
    const approvedCount = reservations.filter(
        res => res.status === 'APPROVED',
    ).length;
    const rejectedCount = reservations.filter(
        res => res.status === 'REJECTED',
    ).length;

    const approvalRate =
        totalReservations > 0
            ? Math.round((approvedCount / totalReservations) * 100)
            : 0;

    const stats = [
        {
            title: 'Alle reservasjoner',
            value: totalReservations,
            description: 'Alle reservasjoner i systemet',
            icon: Calendar,
            color: 'text-blue-600',
        },
        {
            title: 'Venter på svar',
            value: pendingCount,
            description: 'Venter på godkjenning',
            icon: Clock,
            color: 'text-yellow-600',
        },
        {
            title: 'Godkjente',
            value: approvedCount,
            description: 'Antall godkjente reservasjoner',
            icon: CheckCircle,
            color: 'text-green-600',
        },
        {
            title: 'Godkjenningsrate',
            value: `${approvalRate}%`,
            description: 'Andel godkjente reservasjoner',
            icon: TrendingUp,
            color: 'text-purple-600',
        },
    ];

    return (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {stats.map(stat => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.title}>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>
                                {stat.title}
                            </CardTitle>
                            <Icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>
                                {stat.value}
                            </div>
                            <p className='text-muted-foreground text-xs'>
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
