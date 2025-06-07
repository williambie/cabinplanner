'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { House } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
    Menu,
    Home,
    ShoppingCart,
    CheckSquare,
    Calendar,
    Shield,
    LogOut,
    ChevronDown,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const navItems = [
    { path: '/dashboard', label: 'Hjem', icon: Home },
    {
        path: '/dashboard/shopping-list',
        label: 'Handleliste',
        icon: ShoppingCart,
    },
    { path: '/dashboard/todo-list', label: 'Gjøremål', icon: CheckSquare },
    { path: '/dashboard/calendar', label: 'Reservasjoner', icon: Calendar },
];

export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    if (!session) return null;

    const userRole = session?.user?.role;
    const userName = session?.user?.username || 'User';
    const userInitials = userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' });
    };

    return (
        <nav className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full backdrop-blur'>
            <div className='container mx-auto px-4'>
                <div className='flex h-16 items-center justify-between'>
                    {/* Logo */}
                    <Link
                        href='/dashboard'
                        className='flex items-center space-x-2'
                    >
                        <div className='bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg'>
                            <House className='h-5 w-5' />
                        </div>
                        <span className='text-xl font-bold'>
                            Trysil Mountain Lodge
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className='hidden md:flex md:items-center md:space-x-1'>
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <NavLink
                                key={path}
                                path={path}
                                pathname={pathname}
                                icon={Icon}
                            >
                                {label}
                            </NavLink>
                        ))}
                        {userRole === 'ADMIN' && (
                            <NavLink
                                path='/dashboard/admin'
                                pathname={pathname}
                                icon={Shield}
                            >
                                Admin
                            </NavLink>
                        )}
                    </div>

                    {/* User Menu & Mobile Menu */}
                    <div className='flex items-center space-x-2'>
                        {/* User Dropdown - Desktop */}
                        <div className='hidden md:block'>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant='ghost'
                                        className='flex items-center space-x-2 px-3'
                                    >
                                        <Avatar className='h-8 w-8'>
                                            <AvatarFallback>
                                                {userInitials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className='flex flex-col items-start'>
                                            <span className='text-sm font-medium'>
                                                {userName}
                                            </span>
                                        </div>
                                        <ChevronDown className='h-4 w-4' />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align='end'
                                    className='w-56'
                                >
                                    <DropdownMenuLabel>
                                        <div className='flex flex-col space-y-1'>
                                            <p className='text-sm font-medium'>
                                                {userName}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        className='text-red-600'
                                    >
                                        <LogOut className='mr-2 h-4 w-4' />
                                        Log Ut
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Mobile Menu */}
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='md:hidden'
                                >
                                    <Menu className='h-6 w-6' />
                                    <span className='sr-only'>Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side='right' className='w-80'>
                                <SheetHeader>
                                    <SheetTitle className='flex items-center space-x-2'>
                                        <Avatar className='h-10 w-10'>
                                            <AvatarFallback>
                                                {userInitials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className='flex flex-col items-start'>
                                            <span className='text-base font-medium'>
                                                {userName}
                                            </span>
                                        </div>
                                    </SheetTitle>
                                </SheetHeader>

                                <div className='mt-8 flex flex-col space-y-2'>
                                    {navItems.map(
                                        ({ path, label, icon: Icon }) => (
                                            <MobileNavLink
                                                key={path}
                                                path={path}
                                                pathname={pathname}
                                                icon={Icon}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                {label}
                                            </MobileNavLink>
                                        ),
                                    )}
                                    {userRole === 'ADMIN' && (
                                        <MobileNavLink
                                            path='/dashboard/admin'
                                            pathname={pathname}
                                            icon={Shield}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Admin
                                        </MobileNavLink>
                                    )}

                                    <div className='mt-4 border-t pt-4'>
                                        <Button
                                            variant='ghost'
                                            className='w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700'
                                            onClick={handleSignOut}
                                        >
                                            <LogOut className='mr-2 h-4 w-4' />
                                            Log Ut
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
}

interface NavLinkProps {
    path: string;
    pathname: string;
    children: React.ReactNode;
    icon: React.ComponentType<{ className?: string }>;
}

function NavLink({ path, pathname, children, icon: Icon }: NavLinkProps) {
    const isActive = pathname === path;

    return (
        <Link href={path}>
            <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                    'flex items-center space-x-2 px-3',
                    isActive && 'bg-secondary text-secondary-foreground',
                )}
            >
                <Icon className='h-4 w-4' />
                <span>{children}</span>
            </Button>
        </Link>
    );
}

interface MobileNavLinkProps {
    path: string;
    pathname: string;
    children: React.ReactNode;
    icon: React.ComponentType<{ className?: string }>;
    onClick?: () => void;
}

function MobileNavLink({
    path,
    pathname,
    children,
    icon: Icon,
    onClick,
}: MobileNavLinkProps) {
    const isActive = pathname === path;

    return (
        <Link href={path} onClick={onClick}>
            <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                    'w-full justify-start space-x-2',
                    isActive && 'bg-secondary text-secondary-foreground',
                )}
            >
                <Icon className='h-4 w-4' />
                <span>{children}</span>
            </Button>
        </Link>
    );
}
