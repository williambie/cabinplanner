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
            const dummyData = await prisma.dummyToDoList.findMany({});
            return NextResponse.json(dummyData);
        } catch (error) {
            return NextResponse.json(
                { error: 'Oh no! Something went wrong!' },
                { status: 500 },
            );
        }
    } else {
        try {
            const todo = await prisma.toDoList.findMany({
                include: { addedBy: { select: { username: true } } },
            });
            return NextResponse.json(todo);
        } catch (error) {
            return NextResponse.json(
                { error: 'Oh no! Something went wrong!' },
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

    if (userRole === 'DUMMY') {
        return NextResponse.json(
            { error: 'DUMMY users cannot add items to the todo list' },
            { status: 403 },
        );
    }

    const { task } = await req.json();

    try {
        const todo = await prisma.toDoList.create({
            data: {
                task,
                addedById: session.user.id,
            },
            include: { addedBy: { select: { username: true } } },
        });

        return NextResponse.json(todo, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to add task' },
            { status: 500 },
        );
    }
}
