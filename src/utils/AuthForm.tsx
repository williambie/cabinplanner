'use client';

import type React from 'react';
import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const isLoading = status === 'loading';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        if (!username || !password) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');

            const result = await signIn('credentials', {
                username,
                password,
                redirect: false,
                callbackUrl: '/dashboard',
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.replace('/dashboard');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <div className='flex items-center justify-center p-4'>
                <svg
                    className='h-5 w-5 animate-spin text-gray-700'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                >
                    <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                    ></circle>
                    <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                </svg>
            </div>
        );
    }

    return (
        <div className='mx-auto w-full max-w-md overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md'>
            <div className='p-6'>
                <h2 className='mb-1 text-2xl font-bold text-gray-900'>
                    Log inn
                </h2>
                <form onSubmit={handleLogin} className='space-y-4'>
                    {error && (
                        <div className='rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
                            {error}
                        </div>
                    )}

                    <div className='space-y-2'>
                        <label
                            htmlFor='username'
                            className='block text-sm font-medium text-gray-700'
                        >
                            Brukernavn
                        </label>
                        <input
                            id='username'
                            type='text'
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder='Skriv inn brukernavn'
                            disabled={isSubmitting}
                            className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500'
                            required
                        />
                    </div>

                    <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                            <label
                                htmlFor='password'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Passord
                            </label>
                        </div>
                        <input
                            id='password'
                            type='password'
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder='Skriv inn passord'
                            disabled={isSubmitting}
                            className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500'
                            required
                        />
                    </div>

                    <button
                        type='submit'
                        disabled={isSubmitting}
                        className='w-full rounded bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400'
                    >
                        {isSubmitting ? (
                            <div className='flex items-center justify-center'>
                                <svg
                                    className='mr-2 -ml-1 h-4 w-4 animate-spin text-white'
                                    xmlns='http://www.w3.org/2000/svg'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                >
                                    <circle
                                        className='opacity-25'
                                        cx='12'
                                        cy='12'
                                        r='10'
                                        stroke='currentColor'
                                        strokeWidth='4'
                                    ></circle>
                                    <path
                                        className='opacity-75'
                                        fill='currentColor'
                                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                    ></path>
                                </svg>
                                Logger inn...
                            </div>
                        ) : (
                            'Log inn'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
