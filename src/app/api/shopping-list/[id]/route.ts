import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/utils/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    const { id } = await params;

    if (userRole === 'DUMMY') {
        return NextResponse.json(
            { error: 'DUMMY users cannot delete items from the shopping list' },
            { status: 403 },
        );
    }

    try {
        await prisma.shoppingList.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 },
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    const body = await req.json();
    const { itemName, isBought } = body;
    const { id } = await params;

    if (userRole === 'DUMMY') {
        return NextResponse.json(
            { error: 'DUMMY users cannot update items from the shopping list' },
            { status: 403 },
        );
    }

    try {
        const updateData: {
            itemName?: string;
            isBought?: boolean;
        } = {};

        if (itemName) {
            updateData.itemName = itemName;
        }

        if (typeof isBought === 'boolean') {
            updateData.isBought = isBought;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No valid item to update' },
                { status: 400 },
            );
        }

        const updatedItem = await prisma.shoppingList.update({
            where: { id },
            data: updateData,
            include: { addedBy: { select: { username: true } } },
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update item' },
            { status: 500 },
        );
    }
}
