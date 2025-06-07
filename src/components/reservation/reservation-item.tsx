'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
    Calendar,
    Clock,
    Edit,
    Trash2,
    User,
    MessageSquare,
    Check,
    X,
} from 'lucide-react';
import type { Reservation, DummyReservation } from '@/types/Reservation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import ReservationForm from './change-reservation-form';
import VisitorAlert from '@/components/ui/visitor-alert';

interface ReservationItemProps {
    reservation: Reservation | DummyReservation;
    isAdmin: boolean;
    isDummy: boolean;
    onUpdate: (reservation: Reservation) => void;
    onDelete: (id: string) => void;
}

export default function ReservationItem({
    reservation,
    isAdmin,
    isDummy,
    onUpdate,
    onDelete,
}: ReservationItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [adminComment, setAdminComment] = useState(() =>
        'adminComment' in reservation ? (reservation.adminComment ?? '') : '',
    );

    const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>(
        reservation.status,
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showVisitorAlert, setShowVisitorAlert] = useState(false);

    const handleActionClick = (action: string, callback: () => void) => {
        if (isDummy) {
            setShowVisitorAlert(true);
            setTimeout(() => setShowVisitorAlert(false), 5000);
            return;
        }
        callback();
    };

    const handleDelete = async () => {
        try {
            setIsSubmitting(true);
            const res = await fetch(`/api/reservation/${reservation.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error('Failed to delete reservation');
            }

            onDelete(reservation.id);
            setIsDeleting(false);
        } catch (err) {
            setError('Failed to delete reservation');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAdminReview = async () => {
        try {
            setIsSubmitting(true);
            setError(null);

            const res = await fetch(`/api/reservation/${reservation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    adminComment: adminComment.trim() || undefined,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to update reservation');
            }

            const updatedReservation = await res.json();
            onUpdate(updatedReservation);
            setIsReviewing(false);
        } catch (err) {
            setError('Failed to update reservation status');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = () => {
        switch (reservation.status) {
            case 'PENDING':
                return (
                    <Badge
                        variant='outline'
                        className='border-yellow-200 bg-yellow-50 text-yellow-700'
                    >
                        Venter på svar
                    </Badge>
                );
            case 'APPROVED':
                return (
                    <Badge
                        variant='outline'
                        className='border-green-200 bg-green-50 text-green-700'
                    >
                        Godkjent
                    </Badge>
                );
            case 'REJECTED':
                return (
                    <Badge
                        variant='outline'
                        className='border-red-200 bg-red-50 text-red-700'
                    >
                        Avslått
                    </Badge>
                );
            default:
                return <Badge variant='outline'>Ukjent</Badge>;
        }
    };

    return (
        <>
            {showVisitorAlert && <VisitorAlert />}

            <Card className='overflow-hidden'>
                <CardContent className='p-4'>
                    <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
                        <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                                <h3 className='text-lg font-medium'>
                                    {reservation.title}
                                </h3>
                                {getStatusBadge()}
                            </div>

                            <p>{reservation.description}</p>
                            <div className='text-muted-foreground flex flex-col gap-4 text-sm sm:flex-row'>
                                <div className='flex items-center gap-1'>
                                    <Calendar className='h-4 w-4' />
                                    <span>
                                        {format(
                                            parseISO(reservation.startDate),
                                            'MMM d, yyyy',
                                        )}{' '}
                                        -{' '}
                                        {format(
                                            parseISO(reservation.endDate),
                                            'MMM d, yyyy',
                                        )}
                                    </span>
                                </div>

                                <div className='flex items-center gap-1'>
                                    <User className='h-4 w-4' />
                                    <span>
                                        Opprettet av{' '}
                                        {isDummy
                                            ? 'Dummy'
                                            : 'user' in reservation
                                              ? reservation.user.username
                                              : 'Ukjent'}
                                    </span>
                                </div>

                                {'approvedBy' in reservation &&
                                    reservation.approvedBy && (
                                        <div className='flex items-center gap-1'>
                                            <Clock className='h-4 w-4' />
                                            <span>
                                                Sett på av{' '}
                                                {
                                                    reservation.approvedBy
                                                        .username
                                                }
                                            </span>
                                        </div>
                                    )}
                            </div>

                            {'adminComment' in reservation &&
                                reservation.adminComment && (
                                    <div className='bg-muted mt-2 rounded-md p-2 text-sm'>
                                        <div className='mb-1 flex items-center gap-1 font-medium'>
                                            <MessageSquare className='h-4 w-4' />
                                            <span>Admin Kommentar:</span>
                                        </div>
                                        <p>{reservation.adminComment}</p>
                                    </div>
                                )}
                        </div>

                        <div className='flex gap-2 self-end md:self-center'>
                            {isAdmin && reservation.status === 'PENDING' && (
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() =>
                                        handleActionClick('review', () =>
                                            setIsReviewing(true),
                                        )
                                    }
                                >
                                    Svar
                                </Button>
                            )}

                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                    handleActionClick('edit', () =>
                                        setIsEditing(true),
                                    )
                                }
                            >
                                <Edit className='mr-1 h-4 w-4' />
                                Endre
                            </Button>

                            <Button
                                variant='outline'
                                size='sm'
                                className='text-destructive'
                                onClick={() =>
                                    handleActionClick('delete', () =>
                                        setIsDeleting(true),
                                    )
                                }
                            >
                                <Trash2 className='mr-1 h-4 w-4' />
                                Slett
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            {isEditing && !isDummy && (
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Reservation</DialogTitle>
                        </DialogHeader>
                        <ReservationForm
                            reservation={reservation as Reservation}
                            onSuccess={updated => {
                                onUpdate(updated);
                                setIsEditing(false);
                            }}
                            onCancel={() => setIsEditing(false)}
                        />
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation */}
            <AlertDialog
                open={isDeleting && !isDummy}
                onOpenChange={setIsDeleting}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Dette vil slette reservasjonen permanent. Er du
                            sikker på at du vil fortsette?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>
                            Avbryt
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        >
                            {isSubmitting ? 'Sletter...' : 'Slett'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Admin Review Dialog */}
            {isReviewing && !isDummy && (
                <Dialog open={isReviewing} onOpenChange={setIsReviewing}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Review Reservation</DialogTitle>
                        </DialogHeader>

                        {error && (
                            <p className='text-destructive text-sm'>{error}</p>
                        )}

                        <div className='space-y-4 py-4'>
                            <div className='space-y-2'>
                                <h4 className='font-medium'>
                                    Reservasjons Detaljer
                                </h4>
                                <p>{reservation.title}</p>
                                <p>{reservation.description}</p>
                                <p className='text-muted-foreground text-sm'>
                                    {format(
                                        parseISO(reservation.startDate),
                                        'MMM d, yyyy',
                                    )}{' '}
                                    -{' '}
                                    {format(
                                        parseISO(reservation.endDate),
                                        'MMM d, yyyy',
                                    )}
                                </p>
                            </div>

                            <div className='space-y-2'>
                                <h4 className='font-medium'>Status</h4>
                                <div className='flex gap-2'>
                                    <Button
                                        variant={
                                            status === 'APPROVED'
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size='sm'
                                        onClick={() => setStatus('APPROVED')}
                                        className={
                                            status === 'APPROVED'
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : ''
                                        }
                                    >
                                        <Check className='mr-1 h-4 w-4' />
                                        Godkjenn
                                    </Button>
                                    <Button
                                        variant={
                                            status === 'REJECTED'
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size='sm'
                                        onClick={() => setStatus('REJECTED')}
                                        className={
                                            status === 'REJECTED'
                                                ? 'bg-red-600 hover:bg-red-700'
                                                : ''
                                        }
                                    >
                                        <X className='mr-1 h-4 w-4' />
                                        Avslå
                                    </Button>
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <h4 className='font-medium'>Admin Kommentar</h4>
                                <Textarea
                                    value={adminComment}
                                    onChange={e =>
                                        setAdminComment(e.target.value)
                                    }
                                    placeholder='Add a comment (optional)'
                                    rows={3}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant='outline'
                                onClick={() => setIsReviewing(false)}
                                disabled={isSubmitting}
                            >
                                Avbryt
                            </Button>
                            <Button
                                onClick={handleAdminReview}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Lagrer...' : 'Lagrer Svar'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
