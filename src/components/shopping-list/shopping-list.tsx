'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ShoppingCart } from 'lucide-react';
import type { ShoppingListItem } from '@/types/ShoppingListItem';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import VisitorAlert from '@/components/ui/visitor-alert';
import ShoppingListHeader from './shopping-header';
import ShoppingItem from './shopping-item';
import ShoppingProgress from './shopping-progress';
import { Loading } from '@/components/loading/Loading';

export default function ShoppingList() {
    const { data: session } = useSession();
    const [items, setItems] = useState<ShoppingListItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'needed' | 'bought'>('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showVisitorAlert, setShowVisitorAlert] = useState(false);

    const isDummy = session?.user?.role === 'DUMMY';

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await fetch('/api/shopping-list');
            if (!res.ok) throw new Error();
            const data = await res.json();
            setItems(
                data.sort((a: ShoppingListItem, b: ShoppingListItem) =>
                    a.isBought === b.isBought ? 0 : a.isBought ? 1 : -1,
                ),
            );
        } catch {
            setError('Failed to load shopping list. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = (updated: ShoppingListItem) => {
        setItems(prev =>
            prev
                .map(item => (item.id === updated.id ? updated : item))
                .sort((a, b) =>
                    a.isBought === b.isBought ? 0 : a.isBought ? 1 : -1,
                ),
        );
    };

    const handleDelete = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const filteredItems = items.filter(item => {
        if (filter === 'needed') return !item.isBought;
        if (filter === 'bought') return item.isBought;
        return true;
    });

    if (isLoading) return <Loading text='Laster handleliste...' />;

    return (
        <Card className='mx-auto w-full max-w-2xl'>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <ShoppingCart className='h-6 w-6' />
                    Handleliste
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                {showVisitorAlert && <VisitorAlert />}
                {error && (
                    <Alert variant='destructive'>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <ShoppingListHeader
                    items={items}
                    filter={filter}
                    setFilter={setFilter}
                    onItemAdded={item => setItems(prev => [...prev, item])}
                    onClearBought={() =>
                        setItems(prev => prev.filter(i => !i.isBought))
                    }
                    isDummy={isDummy}
                    setShowVisitorAlert={setShowVisitorAlert}
                    onRefresh={fetchItems}
                />

                {filteredItems.length === 0 ? (
                    <div className='text-muted-foreground text-center'>
                        {items.length === 0
                            ? 'Handlelisten er tom!'
                            : 'Ingen varer funnet for dette filteret.'}
                    </div>
                ) : (
                    <div className='space-y-2'>
                        {filteredItems.map(item => (
                            <ShoppingItem
                                key={item.id}
                                item={item}
                                isEditing={editingId === item.id}
                                setEditingId={setEditingId}
                                onUpdated={handleUpdate}
                                onDeleted={handleDelete}
                                isDummy={isDummy}
                                setShowVisitorAlert={setShowVisitorAlert}
                            />
                        ))}
                    </div>
                )}

                <ShoppingProgress items={items} />
            </CardContent>
        </Card>
    );
}
