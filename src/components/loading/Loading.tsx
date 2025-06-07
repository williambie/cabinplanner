import { Card, CardContent } from '@/components/ui/card';

type LoadingProps = {
    text: string;
};

export const Loading = ({ text }: LoadingProps) => {
    return (
        <div className='mx-auto mt-10 max-w-2xl'>
            <Card>
                <CardContent className='p-6'>
                    <div className='flex items-center justify-center'>
                        <div className='border-primary h-8 w-8 animate-spin rounded-full border-b-2'></div>
                        <span className='ml-2'>{text}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
