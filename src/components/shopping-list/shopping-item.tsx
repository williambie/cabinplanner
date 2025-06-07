'use client';

import { useState } from 'react';
import { Check, Edit2, RotateCcw, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ShoppingListItem } from '@/types/ShoppingListItem';

interface ShoppingItemProps {
    item: ShoppingListItem;
    isEditing: boolean;
    setEditingId: (id: string | null) => void;
    onUpdated: (item: ShoppingListItem) => void;
    onDeleted: (id: string) => void;
    isDummy: boolean;
    setShowVisitorAlert: (show: boolean) => void;
}

export default function ShoppingItem({
    item,
    isEditing,
    setEditingId,
    onUpdated,
    onDeleted,
    isDummy,
    setShowVisitorAlert,
}: ShoppingItemProps) {
    const [editText, setEditText] = useState(item.itemName);
    const [loading, setLoading] = useState(false);

    const handleAction = (callback: () => void) => {
        if (isDummy) {
            setShowVisitorAlert(true);
            setTimeout(() => setShowVisitorAlert(false), 5000);
            return;
        }
        callback();
    };

    const toggleBought = async () => {
        handleAction(async () => {
            setLoading(true);
            const res = await fetch(`/api/shopping-list/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isBought: !item.isBought }),
            });
            const updated = await res.json();
            onUpdated(updated);
            setLoading(false);
        });
    };

    const saveEdit = async () => {
        if (!editText.trim()) return;
        setLoading(true);
        const res = await fetch(`/api/shopping-list/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemName: editText.trim() }),
        });
        const updated = await res.json();
        onUpdated(updated);
        setEditingId(null);
        setLoading(false);
    };

    const deleteItem = async () => {
        handleAction(async () => {
            setLoading(true);
            await fetch(`/api/shopping-list/${item.id}`, {
                method: 'DELETE',
            });
            onDeleted(item.id);
            setLoading(false);
        });
    };

    return (
        <div
            className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                item.isBought
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                    : 'bg-background border-border hover:bg-muted/20'
            }`}
        >
            <Checkbox
                checked={item.isBought}
                onCheckedChange={toggleBought}
                disabled={loading}
            />

            {isEditing ? (
                <Input
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') setEditingId(null);
                    }}
                    className='flex-1'
                    disabled={loading}
                    autoFocus
                />
            ) : (
                <span
                    className={`flex-1 ${
                        item.isBought
                            ? 'text-green-700 line-through dark:text-green-300'
                            : 'text-foreground'
                    }`}
                >
                    {item.itemName}
                </span>
            )}

            <div className='flex gap-1'>
                {isEditing ? (
                    <>
                        <Button
                            size='sm'
                            variant='ghost'
                            onClick={saveEdit}
                            disabled={!editText.trim() || loading}
                        >
                            <Check className='h-4 w-4' />
                        </Button>
                        <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => setEditingId(null)}
                            disabled={loading}
                        >
                            <X className='h-4 w-4' />
                        </Button>
                    </>
                ) : (
                    <>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size='icon'
                                    variant='outline'
                                    onClick={() =>
                                        handleAction(() =>
                                            setEditingId(item.id),
                                        )
                                    }
                                >
                                    <Edit2 className='h-4 w-4' />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Rediger</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size='icon'
                                    variant='outline'
                                    className={
                                        item.isBought
                                            ? 'text-orange-600 hover:text-orange-700'
                                            : 'text-green-600 hover:text-green-700'
                                    }
                                    onClick={toggleBought}
                                >
                                    {item.isBought ? (
                                        <RotateCcw className='h-4 w-4' />
                                    ) : (
                                        <Check className='h-4 w-4' />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {item.isBought
                                    ? 'Ikke kjøpt'
                                    : 'Marker som kjøpt'}
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size='icon'
                                    variant='outline'
                                    className='text-destructive'
                                    onClick={deleteItem}
                                >
                                    <Trash2 className='h-4 w-4' />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Slett</TooltipContent>
                        </Tooltip>
                    </>
                )}
            </div>
        </div>
    );
}
