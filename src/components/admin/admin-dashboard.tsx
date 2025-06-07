'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
    Shield,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    AlertTriangle,
    Loader2,
    RefreshCw,
} from 'lucide-react';
import type { Reservation } from '@/types/Reservation';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import AdminReservationList from './admin-reservation-list';
import AdminStats from './admin-stats';
import VisitorAlert from '@/components/ui/visitor-alert';
import { Loading } from '@/components/loading/Loading';

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const isAdmin = session?.user?.role === 'ADMIN';
    const isDummy = session?.user?.role === 'DUMMY';

    useEffect(() => {
        if (status === 'loading') return;

        fetchReservations();
    }, [status, refreshTrigger]);

    const fetchReservations = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await fetch('/api/reservation');

            if (!res.ok) {
                throw new Error(`Error: ${res.status}`);
            }

            const data = await res.json();
            setReservations(data);
        } catch (err) {
            setError('Failed to load reservations. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleReservationUpdated = (updatedReservation: Reservation) => {
        setReservations(prev =>
            prev.map(res =>
                res.id === updatedReservation.id ? updatedReservation : res,
            ),
        );
    };

    const handleReservationDeleted = (id: string) => {
        setReservations(prev => prev.filter(res => res.id !== id));
    };

    if (isLoading) {
        return <Loading text='Laster gjøremål...' />;
    }

    if (isDummy) {
        return (
            <Card className='w-full'>
                <CardContent className='p-6'>
                    <VisitorAlert />
                </CardContent>
            </Card>
        );
    }

    if (!isAdmin) {
        return (
            <Card className='w-full'>
                <CardContent className='p-6'>
                    <Alert variant='destructive'>
                        <AlertTriangle className='h-4 w-4' />
                        <AlertDescription>
                            Adgang nektet. Du må være administrator for å få
                            tilgang til denne siden.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    const pendingReservations = reservations.filter(
        res => res.status === 'PENDING',
    );
    const approvedReservations = reservations.filter(
        res => res.status === 'APPROVED',
    );
    const rejectedReservations = reservations.filter(
        res => res.status === 'REJECTED',
    );

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='flex items-center gap-2 text-3xl font-bold'>
                        <Shield className='h-8 w-8' />
                        Admin Dashboard
                    </h1>
                    <p className='text-muted-foreground mt-1'>
                        Administrer reservasjoner og se statistikk
                    </p>
                </div>
                <Button
                    variant='outline'
                    onClick={handleRefresh}
                    disabled={isLoading}
                >
                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                    />
                    Oppdater Reservasjoner
                </Button>
            </div>

            {error && (
                <Alert variant='destructive'>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Stats Cards */}
            <AdminStats reservations={reservations} isLoading={isLoading} />

            {/* Main Content */}
            <Tabs defaultValue='pending' className='space-y-4'>
                <TabsList className='grid w-full max-w-md grid-cols-4'>
                    <TabsTrigger
                        value='pending'
                        className='flex items-center gap-1'
                    >
                        <Clock className='h-4 w-4' />
                        Venter
                        {pendingReservations.length > 0 && (
                            <Badge variant='secondary' className='ml-1'>
                                {pendingReservations.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value='approved'>
                        <CheckCircle className='mr-1 h-4 w-4' />
                        Godkjent
                    </TabsTrigger>
                    <TabsTrigger value='rejected'>
                        <XCircle className='mr-1 h-4 w-4' />
                        Avslått
                    </TabsTrigger>
                    <TabsTrigger value='all'>
                        <Calendar className='mr-1 h-4 w-4' />
                        Alle
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='pending'>
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Clock className='h-5 w-5 text-yellow-600' />
                                Ventende Reservasjoner
                            </CardTitle>
                            <CardDescription>
                                Reservasjoner som venter på godkjenning
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AdminReservationList
                                reservations={pendingReservations}
                                isLoading={isLoading}
                                onUpdate={handleReservationUpdated}
                                onDelete={handleReservationDeleted}
                                showActions={true}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='approved'>
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <CheckCircle className='h-5 w-5 text-green-600' />
                                Godkjente Reservasjoner
                            </CardTitle>
                            <CardDescription>
                                Reservasjoner som har blitt godkjent
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AdminReservationList
                                reservations={approvedReservations}
                                isLoading={isLoading}
                                onUpdate={handleReservationUpdated}
                                onDelete={handleReservationDeleted}
                                showActions={false}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='rejected'>
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <XCircle className='h-5 w-5 text-red-600' />
                                Avslåtte Reservasjoner
                            </CardTitle>
                            <CardDescription>
                                Reservasjoner som har blitt avslått
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AdminReservationList
                                reservations={rejectedReservations}
                                isLoading={isLoading}
                                onUpdate={handleReservationUpdated}
                                onDelete={handleReservationDeleted}
                                showActions={false}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='all'>
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Calendar className='h-5 w-5' />
                                Alle Reservasjoner
                            </CardTitle>
                            <CardDescription>
                                En komplett liste over alle reservasjoner
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AdminReservationList
                                reservations={reservations}
                                isLoading={isLoading}
                                onUpdate={handleReservationUpdated}
                                onDelete={handleReservationDeleted}
                                showActions={true}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
