'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { CalendarIcon, Plus, RefreshCw } from 'lucide-react';
import type { Reservation, DummyReservation } from '@/types/Reservation';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import ReservationItem from './reservation-item';
import NewReservationForm from './new-reservation-form';
import VisitorAlert from '@/components/ui/visitor-alert';
import { Loading } from '@/components/loading/Loading';

export default function ReservationList() {
    const { data: session, status: sessionStatus } = useSession();
    const [reservations, setReservations] = useState<
        Reservation[] | DummyReservation[]
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showNewForm, setShowNewForm] = useState(false);
    const [activeTab, setActiveTab] = useState<
        'all' | 'pending' | 'approved' | 'rejected'
    >('all');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showVisitorAlert, setShowVisitorAlert] = useState(false);

    const isAdmin = session?.user?.role === 'ADMIN';
    const isDummy = session?.user?.role === 'DUMMY';

    useEffect(() => {
        if (sessionStatus === 'loading') return;

        fetchReservations();
    }, [sessionStatus, refreshTrigger]);

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

    const handleNewReservationClick = () => {
        if (isDummy) {
            setShowVisitorAlert(true);
            setTimeout(() => setShowVisitorAlert(false), 5000);
            return;
        }
        setShowNewForm(!showNewForm);
    };

    const handleReservationAdded = (newReservation: Reservation) => {
        setReservations(prev => [...prev, newReservation]);
        setShowNewForm(false);
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

    const filteredReservations = reservations.filter(res => {
        if (activeTab === 'all') return true;
        if (activeTab === 'pending') return res.status === 'PENDING';
        if (activeTab === 'approved') return res.status === 'APPROVED';
        if (activeTab === 'rejected') return res.status === 'REJECTED';
        return true;
    });

    const pendingCount = reservations.filter(
        res => res.status === 'PENDING',
    ).length;
    const approvedCount = reservations.filter(
        res => res.status === 'APPROVED',
    ).length;
    const rejectedCount = reservations.filter(
        res => res.status === 'REJECTED',
    ).length;

    if (isLoading) {
        return <Loading text='Laster reservasjoner...' />;
    }

    return (
        <Card className='w-full'>
            <CardHeader>
                <div className='flex items-center justify-between'>
                    <div>
                        <CardTitle className='flex items-center gap-2'>
                            <CalendarIcon className='h-5 w-5' />
                            Reservasjons System
                        </CardTitle>
                        <CardDescription>
                            {isDummy
                                ? 'Se mock reservasjoner'
                                : 'Håndter reservasjoner og dine forespørsler.'}
                        </CardDescription>
                    </div>
                    <div className='flex gap-2'>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant='outline'
                                        size='icon'
                                        onClick={handleRefresh}
                                    >
                                        <RefreshCw className='h-4 w-4' />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Oppdater Reservasjoner</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <Button
                            onClick={handleNewReservationClick}
                            variant={showNewForm ? 'secondary' : 'default'}
                        >
                            <Plus className='mr-2 h-4 w-4' />
                            {showNewForm ? 'Avbryt' : 'Ny Reservasjon'}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='space-y-4'>
                {showVisitorAlert && <VisitorAlert />}

                {error && (
                    <Alert variant='destructive'>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {showNewForm && !isDummy && (
                    <div className='bg-muted/30 mb-6 rounded-md border p-4'>
                        <NewReservationForm
                            onSuccess={handleReservationAdded}
                            onCancel={() => setShowNewForm(false)}
                        />
                    </div>
                )}

                <Tabs
                    value={activeTab}
                    onValueChange={value =>
                        setActiveTab(
                            value as
                                | 'pending'
                                | 'approved'
                                | 'rejected'
                                | 'all',
                        )
                    }
                >
                    <TabsList className='mb-4 grid grid-cols-4'>
                        <TabsTrigger value='all'>
                            Alle ({reservations.length})
                        </TabsTrigger>
                        <TabsTrigger value='pending'>
                            Venter på svar ({pendingCount})
                        </TabsTrigger>
                        <TabsTrigger value='approved'>
                            Godkjente ({approvedCount})
                        </TabsTrigger>
                        <TabsTrigger value='rejected'>
                            Avslåtte ({rejectedCount})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab}>
                        {filteredReservations.length === 0 ? (
                            <div className='text-muted-foreground py-8 text-center'>
                                Ingen {activeTab !== 'all' ? activeTab : ''}{' '}
                                reservasjoner funnet.
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                {filteredReservations.map(reservation => (
                                    <ReservationItem
                                        key={reservation.id}
                                        reservation={reservation}
                                        isAdmin={isAdmin}
                                        isDummy={isDummy}
                                        onUpdate={handleReservationUpdated}
                                        onDelete={handleReservationDeleted}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
