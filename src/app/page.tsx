import AuthForm from '@/utils/AuthForm';

export default function LandingPage() {
    return (
        <div className='container mx-auto flex min-h-screen items-center justify-center px-4 py-12'>
            <div className='w-full max-w-md'>
                <h1 className='mb-6 text-center text-3xl font-bold'>
                    Velkommen
                </h1>
                <AuthForm />
            </div>
        </div>
    );
}
