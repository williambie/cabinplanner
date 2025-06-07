'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { ToDoItem } from '@/types/ToDoItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TooltipProvider } from '@/components/ui/tooltip';
import VisitorAlert from '@/components/ui/visitor-alert';
import { Loading } from '@/components/loading/Loading';
import TodoHeader from './todo-header';
import TodoItem from './todo-item';
import TodoProgress from './todo-progress';

export default function TodoList() {
    const { data: session } = useSession();
    const [todos, setTodos] = useState<ToDoItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [editingTask, setEditingTask] = useState<{
        id: string;
        text: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showVisitorAlert, setShowVisitorAlert] = useState(false);

    const isDummy = session?.user?.role === 'DUMMY';

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await fetch('/api/todo-list');
            if (!res.ok) throw new Error();
            const data = await res.json();
            setTodos(data);
        } catch {
            setError('Failed to load tasks. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = (updated: ToDoItem) => {
        setTodos(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    };

    const handleDelete = (id: string) => {
        setTodos(prev => prev.filter(t => t.id !== id));
    };

    const filteredTodos = todos.filter(todo => {
        if (filter === 'active') return !todo.isCompleted;
        if (filter === 'completed') return todo.isCompleted;
        return true;
    });

    if (isLoading) return <Loading text='Laster gjøremål...' />;

    return (
        <TooltipProvider>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                        <span>Gjøremål</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {showVisitorAlert && <VisitorAlert />}
                    {error && (
                        <Alert variant='destructive'>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <TodoHeader
                        todos={todos}
                        filter={filter}
                        setFilter={setFilter}
                        onTaskAdded={task => setTodos(prev => [...prev, task])}
                        onRefresh={fetchTodos}
                        isDummy={isDummy}
                        setShowVisitorAlert={setShowVisitorAlert}
                    />

                    <div className='space-y-2'>
                        {filteredTodos.length === 0 ? (
                            <div className='text-muted-foreground py-8 text-center'>
                                {todos.length === 0
                                    ? 'Ingen oppgaver enda. Legg til en over!'
                                    : filter === 'active'
                                      ? 'Ingen aktive gjøremål!'
                                      : 'Ingen gjennomførte oppgaver!'}
                            </div>
                        ) : (
                            filteredTodos.map(todo => (
                                <TodoItem
                                    key={todo.id}
                                    todo={todo}
                                    isEditing={editingTask?.id === todo.id}
                                    editingText={editingTask?.text || ''}
                                    setEditingTask={setEditingTask}
                                    onSaved={handleUpdate}
                                    onDeleted={handleDelete}
                                    isDummy={isDummy}
                                    setShowVisitorAlert={setShowVisitorAlert}
                                />
                            ))
                        )}
                    </div>
                    <TodoProgress items={todos} />
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
