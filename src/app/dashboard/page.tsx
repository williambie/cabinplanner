'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
    Calendar,
    CheckSquare,
    ShoppingCart,
    Link as LucideLink,
    ArrowRight,
    CheckCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import DepartureChecklist from '@/components/checklist/DepartureChecklist';
import MockDepartureChecklist from '@/components/checklist/MockDepartureChecklist';

const quickActions = [
    {
        title: 'Reservasjoner',
        description: 'Håndter reservasjoner',
        icon: Calendar,
        href: '/dashboard/calendar',
        color: 'bg-blue-500',
    },
    {
        title: 'Gjøremål',
        description: 'Se og fullfør oppgaver',
        icon: CheckSquare,
        href: '/dashboard/todo-list',
        color: 'bg-green-500',
    },
    {
        title: 'Handleliste',
        description: 'Administrer felles handleliste',
        icon: ShoppingCart,
        href: '/dashboard/shopping-list',
        color: 'bg-purple-500',
    },
];

export default function DashboardPage() {
    const { data: session, status } = useSession();

    const userName = session?.user?.username || 'Guest';
    const userRole = session?.user?.role;
    const isDummy = userRole === 'DUMMY';

    if (status === 'loading') {
        return <DashboardSkeleton />;
    }

    return (
        <div className='min-h-screen'>
            {/* Hero Section */}
            <div className='relative flex min-h-[70vh] w-full items-center justify-center text-white'>
                <div className='absolute h-full w-full'>
                    <Image
                        src='/wallpaper.webp'
                        alt='Trysil Mountain Lodge'
                        fill
                        className='object-cover'
                        priority
                    />
                    <div className='absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60'></div>
                </div>

                <div className='relative z-10 flex max-w-4xl flex-col items-center px-6 text-center'>
                    {isDummy && (
                        <Badge
                            variant='outline'
                            className='mb-4 border-white/40 bg-white/60 px-4 py-1 text-sm font-medium backdrop-blur-sm'
                        >
                            Visitor Mode
                        </Badge>
                    )}

                    <h1 className='mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-4xl font-bold tracking-wider text-transparent md:text-6xl'>
                        TRYSIL MOUNTAIN LODGE
                    </h1>

                    <p className='mb-8 max-w-2xl text-lg leading-relaxed text-gray-200 md:text-xl'>
                        Velkommen,{' '}
                        <span className='font-semibold text-white'>
                            {userName}
                        </span>
                        ! Her er kan du legge inn felles gjøremål, handleliste
                        og reservasjoner for ditt opphold.
                    </p>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className='container mx-auto px-4 py-12'>
                {/* Quick Actions */}
                <div className='mb-12'>
                    <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold'>
                        <LucideLink className='text-primary h-6 w-6' />
                        <span className='from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-transparent'>
                            Hurtiglenker
                        </span>
                        <div className='from-primary/100 ml-4 h-px flex-1 bg-gradient-to-r to-transparent'></div>
                    </h2>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        {quickActions.map(action => {
                            const Icon = action.icon;
                            return (
                                <Card
                                    key={action.title}
                                    className='group hover:shadow-primary/5 hover:border-t-primary border-t-4 border-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
                                >
                                    <CardHeader>
                                        <div className='flex items-center gap-3'>
                                            <div
                                                className={`rounded-lg p-2 ${action.color} text-white shadow-lg`}
                                            >
                                                <Icon className='h-6 w-6' />
                                            </div>
                                            <div>
                                                <CardTitle className='text-lg'>
                                                    {action.title}
                                                </CardTitle>
                                                <CardDescription>
                                                    {action.description}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Link href={action.href}>
                                            <Button className='group-hover:bg-primary/90 w-full transition-all'>
                                                Sett i gang
                                                <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Full-width Departure Checklist */}
                <div className='w-full'>
                    <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold'>
                        <span className='flex items-center gap-2'>
                            <CheckCheck className='text-primary h-6 w-6' />
                            <span className='from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-transparent'>
                                Huskeliste ved avreise
                            </span>
                        </span>
                        <div className='from-primary/100 ml-4 h-px flex-1 bg-gradient-to-r to-transparent'></div>
                    </h2>
                    <div className='w-full'>
                        {isDummy ? (
                            <MockDepartureChecklist />
                        ) : (
                            <DepartureChecklist />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className='min-h-screen'>
            {/* Hero Skeleton */}
            <div className='bg-muted relative flex min-h-[70vh] w-full items-center justify-center'>
                <div className='flex flex-col items-center space-y-4'>
                    <Skeleton className='h-16 w-16 rounded-full' />
                    <Skeleton className='h-8 w-32' />
                    <Skeleton className='h-16 w-96' />
                    <Skeleton className='h-6 w-80' />
                    <div className='flex gap-4'>
                        <Skeleton className='h-12 w-32' />
                        <Skeleton className='h-12 w-32' />
                    </div>
                </div>
            </div>

            {/* Content Skeleton */}
            <div className='container mx-auto px-4 py-12'>
                <div className='mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className='p-6'>
                                <Skeleton className='h-16 w-full' />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
