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
            { error: 'Cannot delete ToDo`s as a Dummy user' },
            { status: 403 },
        );
    }

    try {
        await prisma.toDoList.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete ToDo' },
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
    const { id } = await params;
    const body = await req.json();
    const { task, isCompleted } = body;

    if (userRole === 'DUMMY') {
        return NextResponse.json(
            { error: 'Cannot update ToDo`s as a Dummy user' },
            { status: 403 },
        );
    }

    try {
        const updateData: {
            task?: string;
            isCompleted?: boolean;
        } = {};

        if (task) {
            updateData.task = task;
        }

        if (typeof isCompleted === 'boolean') {
            updateData.isCompleted = isCompleted;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No ToDo provided to update' },
                { status: 400 },
            );
        }

        const updateToDo = await prisma.toDoList.update({
            where: { id },
            data: updateData,
            include: { addedBy: { select: { username: true } } },
        });

        return NextResponse.json(updateToDo);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update ToDo' },
            { status: 500 },
        );
    }
}
