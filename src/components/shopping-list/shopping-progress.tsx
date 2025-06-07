'use client';

import type { ShoppingListItem } from '@/types/ShoppingListItem';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface Props {
    items: ShoppingListItem[];
}

export default function ShoppingProgress({ items }: Props) {
    const total = items.length;
    const bought = items.filter(i => i.isBought).length;
    const percent = total > 0 ? Math.round((bought / total) * 100) : 0;

    if (total === 0) return null;

    return (
        <div className='border-t pt-4'>
            <div className='text-muted-foreground mb-2 flex justify-between text-sm'>
                <span>Har jeg alt?</span>
                <span>
                    {bought} av {total} varer
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
