'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Plus } from 'lucide-react';
import type { ToDoItem } from '@/types/ToDoItem';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface Props {
    todos: ToDoItem[];
    filter: 'all' | 'active' | 'completed';
    setFilter: (filter: 'all' | 'active' | 'completed') => void;
    onTaskAdded: (task: ToDoItem) => void;
    onRefresh: () => void;
    isDummy: boolean;
    setShowVisitorAlert: (show: boolean) => void;
}

export default function TodoHeader({
    todos,
    filter,
    setFilter,
    onTaskAdded,
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
        const res = await fetch('/api/todo-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: input.trim() }),
        });
        const newTask = await res.json();
        onTaskAdded(newTask);
        setInput('');
        setIsAdding(false);
    };

    const completedCount = todos.filter(t => t.isCompleted).length;
    const activeCount = todos.length - completedCount;

    return (
        <div className='space-y-4'>
            <div className='flex gap-2'>
                <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    placeholder='Legg til gjøremål...'
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
                        <p>Legg til ny oppgave</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant='outline' onClick={onRefresh}>
                            <RefreshCw className='h-4 w-4' />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Oppdater listen</p>
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
                        Alle ({todos.length})
                    </Button>
                    <Button
                        variant={filter === 'active' ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => setFilter('active')}
                    >
                        Aktive ({activeCount})
                    </Button>
                    <Button
                        variant={filter === 'completed' ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => setFilter('completed')}
                    >
                        Fullført ({completedCount})
                    </Button>
                </div>
            </div>
        </div>
    );
}
