'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { User, MessageSquare, Check, X, Trash2, Edit } from 'lucide-react';
import type { Reservation } from '@/types/Reservation';

import { Button } from '@/components/ui/button';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface AdminReservationListProps {
    reservations: Reservation[];
    isLoading: boolean;
    onUpdate: (reservation: Reservation) => void;
    onDelete: (id: string) => void;
    showActions: boolean;
}

export default function AdminReservationList({
    reservations,
    isLoading,
    onUpdate,
    onDelete,
    showActions,
}: AdminReservationListProps) {
    const [reviewingReservation, setReviewingReservation] =
        useState<Reservation | null>(null);
    const [deletingReservation, setDeletingReservation] =
        useState<Reservation | null>(null);
    const [adminComment, setAdminComment] = useState('');
    const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>(
        'PENDING',
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReview = (reservation: Reservation) => {
        setReviewingReservation(reservation);
        setAdminComment(reservation.adminComment || '');
        setStatus(reservation.status);
        setError(null);
    };

    const handleSubmitReview = async () => {
        if (!reviewingReservation) return;

        try {
            setIsSubmitting(true);
            setError(null);

            const res = await fetch(
                `/api/reservation/${reviewingReservation.id}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status,
                        adminComment: adminComment.trim() || undefined,
                    }),
                },
            );

            if (!res.ok) {
                throw new Error('Failed to update reservation');
            }

            const updatedReservation = await res.json();
            onUpdate(updatedReservation);
            setReviewingReservation(null);
        } catch (err) {
            setError('Failed to update reservation status');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingReservation) return;

        try {
            setIsSubmitting(true);
            const res = await fetch(
                `/api/reservation/${deletingReservation.id}`,
                {
                    method: 'DELETE',
                },
            );

            if (!res.ok) {
                throw new Error('Failed to delete reservation');
            }

            onDelete(deletingReservation.id);
            setDeletingReservation(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return (
                    <Badge
                        variant='outline'
                        className='border-yellow-200 bg-yellow-50 text-yellow-700'
                    >
                        Ventende
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
                return <Badge variant='outline'>Unknown</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className='flex items-center justify-center py-8'>
                <div className='border-primary h-8 w-8 animate-spin rounded-full border-b-2'></div>
            </div>
        );
    }

    if (reservations.length === 0) {
        return (
            <div className='text-muted-foreground py-8 text-center'>
                Ingen reservasjoner funnet.
            </div>
        );
    }

    return (
        <>
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tittel</TableHead>
                            <TableHead>Datoer</TableHead>
                            <TableHead>Bruker</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Lagd</TableHead>
                            {showActions && (
                                <TableHead className='text-right'>
                                    Handlinger
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reservations.map(reservation => (
                            <TableRow key={reservation.id}>
                                <TableCell className='font-medium'>
                                    <div>
                                        <div>{reservation.title}</div>
                                        {reservation.adminComment && (
                                            <div className='text-muted-foreground mt-1 flex items-center gap-1 text-xs'>
                                                <MessageSquare className='h-3 w-3' />
                                                {reservation.adminComment}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='text-sm'>
                                        <div>
                                            {format(
                                                parseISO(reservation.startDate),
                                                'MMM d, yyyy',
                                            )}
                                        </div>
                                        <div className='text-muted-foreground'>
                                            to{' '}
                                            {format(
                                                parseISO(reservation.endDate),
                                                'MMM d, yyyy',
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='flex items-center gap-1'>
                                        <User className='h-4 w-4' />
                                        {reservation.user.username}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(reservation.status)}
                                </TableCell>
                                <TableCell className='text-muted-foreground text-sm'>
                                    {reservation.createdAt &&
                                        format(
                                            parseISO(reservation.createdAt),
                                            'MMM d, yyyy',
                                        )}
                                </TableCell>
                                {showActions && (
                                    <TableCell className='text-right'>
                                        <div className='flex justify-end gap-1'>
                                            {reservation.status ===
                                                'PENDING' && (
                                                <Button
                                                    variant='outline'
                                                    size='sm'
                                                    onClick={() =>
                                                        handleReview(
                                                            reservation,
                                                        )
                                                    }
                                                >
                                                    <Edit className='mr-1 h-4 w-4' />
                                                    Se på
                                                </Button>
                                            )}
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                className='text-destructive'
                                                onClick={() =>
                                                    setDeletingReservation(
                                                        reservation,
                                                    )
                                                }
                                            >
                                                <Trash2 className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Review Dialog */}
            {reviewingReservation && (
                <Dialog
                    open={!!reviewingReservation}
                    onOpenChange={() => setReviewingReservation(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Håndter Reservasjon</DialogTitle>
                        </DialogHeader>

                        {error && (
                            <p className='text-destructive text-sm'>{error}</p>
                        )}

                        <div className='space-y-4 py-4'>
                            <div className='space-y-2'>
                                <h4 className='font-medium'>
                                    Reservasjon Detaljer
                                </h4>
                                <p>{reviewingReservation.description}</p>
                                <p className='text-muted-foreground text-sm'>
                                    {format(
                                        parseISO(
                                            reviewingReservation.startDate,
                                        ),
                                        'MMM d, yyyy',
                                    )}{' '}
                                    -{' '}
                                    {format(
                                        parseISO(reviewingReservation.endDate),
                                        'MMM d, yyyy',
                                    )}
                                </p>
                                <p className='text-muted-foreground text-sm'>
                                    Requested by:{' '}
                                    {reviewingReservation.user.username}
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
                                <h4 className='font-medium'>Admin Comment</h4>
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
                                onClick={() => setReviewingReservation(null)}
                                disabled={isSubmitting}
                            >
                                Avbryt
                            </Button>
                            <Button
                                onClick={handleSubmitReview}
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? 'Submitting...'
                                    : 'Submit Review'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation */}
            <AlertDialog
                open={!!deletingReservation}
                onOpenChange={() => setDeletingReservation(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Dette vil permanent slette reservasjonen, er du
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
        </>
    );
}
