'use client';

import { useState } from 'react';
import type { ToDoItem } from '@/types/ToDoItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Check, Trash2, Edit2, RotateCcw, X } from 'lucide-react';

interface Props {
    todo: ToDoItem;
    isEditing: boolean;
    editingText: string;
    setEditingTask: (task: { id: string; text: string } | null) => void;
    onSaved: (item: ToDoItem) => void;
    onDeleted: (id: string) => void;
    isDummy: boolean;
    setShowVisitorAlert: (show: boolean) => void;
}

export default function TodoItem({
    todo,
    isEditing,
    editingText,
    setEditingTask,
    onSaved,
    onDeleted,
    isDummy,
    setShowVisitorAlert,
}: Props) {
    const [editText, setEditText] = useState(editingText || todo.task);
    const [loading, setLoading] = useState(false);

    const handleAction = (callback: () => void) => {
        if (isDummy) {
            setShowVisitorAlert(true);
            setTimeout(() => setShowVisitorAlert(false), 5000);
            return;
        }
        callback();
    };

    const toggleComplete = async () => {
        handleAction(async () => {
            setLoading(true);
            const res = await fetch(`/api/todo-list/${todo.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCompleted: !todo.isCompleted }),
            });
            const updated = await res.json();
            onSaved(updated);
            setLoading(false);
        });
    };

    const saveEdit = async () => {
        if (!editText.trim()) return;
        setLoading(true);
        const res = await fetch(`/api/todo-list/${todo.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: editText.trim() }),
        });
        const updated = await res.json();
        onSaved(updated);
        setEditingTask(null);
        setLoading(false);
    };

    const deleteItem = async () => {
        handleAction(async () => {
            setLoading(true);
            await fetch(`/api/todo-list/${todo.id}`, {
                method: 'DELETE',
            });
            onDeleted(todo.id);
            setLoading(false);
        });
    };

    return (
        <div
            className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                todo.isCompleted
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                    : 'bg-background border-border hover:bg-muted/20'
            }`}
        >
            <Checkbox
                checked={todo.isCompleted}
                onCheckedChange={toggleComplete}
                disabled={loading}
            />

            {isEditing ? (
                <Input
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') setEditingTask(null);
                    }}
                    className='flex-1'
                    disabled={loading}
                    autoFocus
                />
            ) : (
                <span
                    className={`flex-1 ${
                        todo.isCompleted
                            ? 'text-green-700 line-through dark:text-green-300'
                            : 'text-foreground'
                    }`}
                >
                    {todo.task}
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
                            onClick={() => setEditingTask(null)}
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
                                            setEditingTask({
                                                id: todo.id,
                                                text: todo.task,
                                            }),
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
                                        todo.isCompleted
                                            ? 'text-orange-600 hover:text-orange-700'
                                            : 'text-green-600 hover:text-green-700'
                                    }
                                    onClick={toggleComplete}
                                >
                                    {todo.isCompleted ? (
                                        <RotateCcw className='h-4 w-4' />
                                    ) : (
                                        <Check className='h-4 w-4' />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {todo.isCompleted
                                    ? 'Merk som ufullført'
                                    : 'Merk som fullført'}
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
