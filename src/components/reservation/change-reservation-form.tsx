'use client';

import type React from 'react';
import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Reservation } from '@/types/Reservation';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ReservationFormProps {
    reservation: Reservation;
    onSuccess: (reservation: Reservation) => void;
    onCancel: () => void;
}

export default function ReservationForm({
    reservation,
    onSuccess,
    onCancel,
}: ReservationFormProps) {
    const [title, setTitle] = useState(reservation.title ?? '');
    const [description, setDescription] = useState(
        reservation.description ?? '',
    );
    const [startDate, setStartDate] = useState<Date>(
        parseISO(reservation.startDate),
    );
    const [endDate, setEndDate] = useState<Date>(parseISO(reservation.endDate));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description.trim() || !startDate || !endDate) {
            setError('Please fill in all fields');
            return;
        }

        if (startDate > endDate) {
            setError('End date must be after start date');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const res = await fetch(`/api/reservation/${reservation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(
                    errorData.error || 'Failed to update reservation',
                );
            }

            const updatedReservation = await res.json();
            onSuccess(updatedReservation);
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to update reservation',
            );
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStartDateSelect = (date: Date | undefined) => {
        if (date) {
            setStartDate(date);
        }
    };

    const handleEndDateSelect = (date: Date | undefined) => {
        if (date) {
            setEndDate(date);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='space-y-4'>
            {error && (
                <Alert variant='destructive'>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className='space-y-2'>
                <label htmlFor='title' className='text-sm font-medium'>
                    Tittel
                </label>
                <Input
                    id='title'
                    type='text'
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder='Legg til tittel...'
                    required
                    disabled={isSubmitting}
                />
                <label htmlFor='description' className='text-sm font-medium'>
                    Beskrivelse
                </label>
                <Textarea
                    id='description'
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder='Legg til detaljer...'
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Start Dato</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant='outline'
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !startDate && 'text-muted-foreground',
                                )}
                                disabled={isSubmitting}
                            >
                                <CalendarIcon className='mr-2 h-4 w-4' />
                                {startDate
                                    ? format(startDate, 'PPP')
                                    : 'Select date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0'>
                            <Calendar
                                mode='single'
                                selected={startDate}
                                onSelect={handleStartDateSelect}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Slutt Dato</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant='outline'
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !endDate && 'text-muted-foreground',
                                )}
                                disabled={isSubmitting}
                            >
                                <CalendarIcon className='mr-2 h-4 w-4' />
                                {endDate ? format(endDate, 'PPP') : 'Velg Dato'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0'>
                            <Calendar
                                mode='single'
                                selected={endDate}
                                onSelect={handleEndDateSelect}
                                initialFocus
                                disabled={date =>
                                    startDate ? date < startDate : false
                                }
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className='flex justify-end gap-2 pt-2'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Avbryt
                </Button>
                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? 'Lagrer...' : 'Lagre Endringer'}
                </Button>
            </div>
        </form>
    );
}
