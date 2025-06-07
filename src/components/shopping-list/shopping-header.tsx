'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Plus } from 'lucide-react';
import type { ShoppingListItem } from '@/types/ShoppingListItem';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface Props {
    items: ShoppingListItem[];
    filter: 'all' | 'needed' | 'bought';
    setFilter: (filter: 'all' | 'needed' | 'bought') => void;
    onItemAdded: (item: ShoppingListItem) => void;
    onClearBought: () => void;
    onRefresh: () => void;
    isDummy: boolean;
    setShowVisitorAlert: (show: boolean) => void;
}

export default function ShoppingListHeader({
    items,
    filter,
    setFilter,
    onItemAdded,
    onClearBought,
    onRefresh,
    isDummy,
    setShowVisitorAlert,
}: Props) {
    const [input, setInput] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = async () => {
        if (!input.trim()) return;

        if (isDummy) {
            setShowVisitorAlert(true);
            setTimeout(() => setShowVisitorAlert(false), 5000);
            return;
        }

        setIsAdding(true);
        const res = await fetch('/api/shopping-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemName: input.trim() }),
        });
        const newItem = await res.json();
        onItemAdded(newItem);
        setInput('');
        setIsAdding(false);
    };

    const boughtCount = items.filter(i => i.isBought).length;
    const neededCount = items.length - boughtCount;

    return (
        <div className='space-y-4'>
            <div className='flex gap-2'>
                <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    placeholder='Legg til vare...'
                    disabled={isAdding}
                />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={handleAdd}
                            disabled={!input.trim() || isAdding}
                        >
                            <Plus className='h-4 w-4' />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Legg til ny vare</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant='outline' onClick={onRefresh}>
                            <RefreshCw className='h-4 w-4' />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Oppdater handlelisten</p>
                    </TooltipContent>
                </Tooltip>
            </div>

            <div className='flex items-center justify-between'>
                <div className='flex gap-2'>
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => setFilter('all')}
                    >
                        Alt ({items.length})
                    </Button>
                    <Button
                        variant={filter === 'needed' ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => setFilter('needed')}
                    >
                        Trenger ({neededCount})
                    </Button>
                    <Button
                        variant={filter === 'bought' ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => setFilter('bought')}
                    >
                        Kjøpt ({boughtCount})
                    </Button>
                </div>
                {boughtCount > 0 && (
                    <Button size='sm' variant='outline' onClick={onClearBought}>
                        Fjern kjøpte varer
                    </Button>
                )}
            </div>
        </div>
    );
}
