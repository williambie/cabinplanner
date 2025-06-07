export type ReservationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
    id: string;
    username: string;
    role: 'ADMIN' | 'USER' | 'DUMMY';
}

export interface Reservation {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    description: string;
    status: ReservationStatus;
    adminComment?: string;
    userId: string;
    approvedById?: string;
    user: {
        username: string;
    };
    approvedBy?: {
        username: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface DummyReservation {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    description: string;
    status: ReservationStatus;
}
