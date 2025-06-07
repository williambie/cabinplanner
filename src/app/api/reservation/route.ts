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
            const dummyData = await prisma.dummyReservation.findMany({});
            return NextResponse.json(dummyData);
        } catch (error) {
            return NextResponse.json(
                { error: 'Oh no! Something went wrong!' },
                { status: 500 },
            );
        }
    } else {
        try {
            const reservations = await prisma.reservation.findMany({
                include: {
                    user: { select: { username: true } },
                    approvedBy: { select: { username: true } },
                },
            });

            return NextResponse.json(reservations);
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
    const { title, startDate, endDate, description } = await req.json();

    if (userRole === 'DUMMY') {
        return NextResponse.json(
            { error: 'DUMMY users cannot add items to the reservation list' },
            { status: 403 },
        );
    }

    try {
        const reservation = await prisma.reservation.create({
            data: {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                description,
                title,
                userId: session.user.id,
            },
            include: {
                user: { select: { username: true } },
            },
        });

        return NextResponse.json(reservation);
    } catch (error) {
        return NextResponse.json(
            { error: 'Oh no! Something went wrong!' },
            { status: 500 },
        );
    }
}
