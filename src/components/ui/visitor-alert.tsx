'use client';

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function VisitorAlert() {
    return (
        <Alert variant='destructive' className='mb-4'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
                Du har ikke tilgang til å gjøre det 😁
            </AlertDescription>
        </Alert>
    );
}
