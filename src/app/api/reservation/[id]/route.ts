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
            { error: 'DUMMY users cannot delete items from the calendar' },
            { status: 403 },
        );
    }

    try {
        await prisma.reservation.delete({
            where: { id },
        });

        return NextResponse.json({ success: 'Item deleted' });
    } catch (error) {
        return NextResponse.json(
            { error: 'Oh no! Something went wrong!' },
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

    if (!id) {
        return NextResponse.json(
            { error: 'Reservation ID is required' },
            { status: 400 },
        );
    }

    const body = await req.json();
    const { title, startDate, endDate, description, status, adminComment } =
        body;

    const updateData: {
        title?: string;
        startDate?: Date;
        endDate?: Date;
        description?: string;
        status?: 'PENDING' | 'APPROVED' | 'REJECTED';
        adminComment?: string;
        approvedById?: string;
    } = {};

    if (userRole === 'DUMMY') {
        return NextResponse.json(
            { error: 'DUMMY users cannot update items in the calendar' },
            { status: 403 },
        );
    }

    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (description) updateData.description = description;
    if (title) updateData.title = title;

    if (userRole === 'ADMIN') {
        if (status) updateData.status = status;
        if (adminComment) {
            updateData.adminComment = adminComment;
            updateData.approvedById = session.user.id;
        }
    } else if (status || adminComment) {
        return NextResponse.json(
            { error: 'Only admins can update status and comment' },
            { status: 403 },
        );
    }

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
            { error: 'No changes submitted' },
            { status: 400 },
        );
    }

    try {
        const updatedReservation = await prisma.reservation.update({
            where: { id },
            data: updateData,
            include: {
                user: { select: { username: true } },
                approvedBy: { select: { username: true } },
            },
        });

        return NextResponse.json(updatedReservation);
    } catch (error) {
        return NextResponse.json(
            { error: 'Oh no! Something went wrong!' },
            { status: 500 },
        );
    }
}
