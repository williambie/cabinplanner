'use client';

import type { ToDoItem } from '@/types/ToDoItem';

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface Props {
    items: ToDoItem[];
}

export default function TodoProgress({ items }: Props) {
    const total = items.length;
    const done = items.filter(i => i.isCompleted).length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    if (total === 0) return null;

    return (
        <div className='border-t pt-4'>
            <div className='text-muted-foreground mb-2 flex justify-between text-sm'>
                <span>Har jeg gjort alt?</span>
                <span>
                    {done} av {total} oppgaver
                </span>
            </div>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className='bg-muted h-2 w-full cursor-help rounded-full'>
                        <div
                            className='h-2 rounded-full bg-green-500 transition-all duration-300'
                            style={{ width: `${percent}%` }}
                        ></div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{percent}% fullført</p>
                </TooltipContent>
            </Tooltip>
        </div>
    );
}
