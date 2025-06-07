import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    const secret = process.env.NEXTAUTH_SECRET;
    const token = await getToken({ req, secret });

    const { pathname } = req.nextUrl;

    // Redirect authenticated users from `/` to `/dashboard`
    if (pathname === '/' && token) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // If no token and trying to access /dashboard, redirect to login (root)
    if (!token && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    // If token exists, enforce role-based access
    if (token) {
        switch (token.role) {
            case 'ADMIN':
                if (!pathname.startsWith('/dashboard')) {
                    return NextResponse.redirect(
                        new URL('/dashboard/admin', req.url),
                    );
                }
                break;
            case 'REGULAR':
            case 'DUMMY':
                if (
                    pathname === '/dashboard/admin' ||
                    (!pathname.startsWith('/dashboard/shopping-list') &&
                        !pathname.startsWith('/dashboard/todo-list') &&
                        !pathname.startsWith('/dashboard/calendar') &&
                        pathname !== '/dashboard')
                ) {
                    return NextResponse.redirect(
                        new URL('/dashboard', req.url),
                    );
                }
                break;
            default:
                return NextResponse.redirect(new URL('/', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/dashboard/:path*'],
};
