import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/utils/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;

    if (userRole === 'DUMMY') {
        try {
            const dummyShoppingList = await prisma.dummyShoppingList.findMany(
                {},
            );
            return NextResponse.json(dummyShoppingList);
        } catch (error) {
            return NextResponse.json(
                { error: 'Internal Server Error' },
                { status: 500 },
            );
        }
    } else {
        try {
            const shoppingList = await prisma.shoppingList.findMany({
                include: { addedBy: { select: { username: true } } },
            });
            return NextResponse.json(shoppingList);
        } catch (error) {
            return NextResponse.json(
                { error: 'Internal Server Error' },
                { status: 500 },
            );
        }
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;

    try {
        if (userRole === 'DUMMY') {
            return NextResponse.json(
                { error: 'DUMMY users cannot add items to the shopping list' },
                { status: 403 },
            );
        }

        const { itemName } = await req.json();

        if (!itemName) {
            return NextResponse.json(
                { error: 'Item name is required' },
                { status: 400 },
            );
        }

        const newItem = await prisma.shoppingList.create({
            data: {
                itemName,
                addedById: session.user.id,
            },
            include: { addedBy: { select: { username: true } } },
        });

        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 },
        );
    }
}
