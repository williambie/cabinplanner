import CredentialsProvider from 'next-auth/providers/credentials';
import { type NextAuthOptions } from 'next-auth';
import { prisma } from '@/utils/prisma';
import bcryptjs from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
        maxAge: 1 * 86400, // 1 day in seconds
    },
    jwt: {
        maxAge: 14 * 86400, // 14 days in seconds
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: {
                    label: 'Username',
                    type: 'text',
                },
                password: {
                    label: 'Password',
                    type: 'password',
                },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { username: credentials.username },
                    });

                    if (!user) {
                        return null;
                    }

                    const isPasswordValid = await bcryptjs.compare(
                        credentials.password,
                        user.password,
                    );

                    if (!isPasswordValid) {
                        return null;
                    }

                    return {
                        id: user.id,
                        username: user.username,
                        role: user.role,
                    };
                } catch (error) {
                    console.log('Error in authorize', error);
                    throw new Error('Noe gikk galt');
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            session.user.id = token.id as string;
            session.user.username = token.name as string;
            session.user.role = token.role as string;
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.username;
                token.role = user.role;
            }
            return token;
        },
    },
    pages: {
        signIn: '/',
    },
};
