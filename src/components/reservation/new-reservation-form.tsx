'use client';

import type React from 'react';
import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { Reservation } from '@/types/Reservation';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface NewReservationFormProps {
    onSuccess: (reservation: Reservation) => void;
    onCancel: () => void;
}

export default function NewReservationForm({
    onSuccess,
    onCancel,
}: NewReservationFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
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

            const res = await fetch('/api/reservation', {
                method: 'POST',
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
                    errorData.error || 'Failed to create reservation',
                );
            }

            const newReservation = await res.json();
            onSuccess(newReservation);
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to create reservation',
            );
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStartDateSelect = (date: Date | undefined) => {
        setStartDate(date);
    };

    const handleEndDateSelect = (date: Date | undefined) => {
        setEndDate(date);
    };

    return (
        <form onSubmit={handleSubmit} className='space-y-4'>
            <h3 className='text-lg font-medium'>Ny reservasjon</h3>

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
                    className='border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
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
                                {endDate
                                    ? format(endDate, 'PPP')
                                    : 'Select date'}
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
                    {isSubmitting ? 'Oppretter...' : 'Opprett Reservasjon'}
                </Button>
            </div>
        </form>
    );
}
