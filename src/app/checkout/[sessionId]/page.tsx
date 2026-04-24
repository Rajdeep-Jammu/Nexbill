"use client";

import { useParams } from 'next/navigation';
import CustomerLayout from '../../customer-layout';
import PageHeader from "@/components/PageHeader";
import CheckoutSessionDisplay from '@/components/checkout/CheckoutSessionDisplay';
import { useSessionsStore } from '@/hooks/use-sessions-store';
import { useAuthStore } from '@/hooks/use-auth-store';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CheckoutPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;

    const getSession = useSessionsStore(state => state.getSession);
    const { qrCodeUrl, upiId } = useAuthStore(state => ({ qrCodeUrl: state.qrCodeUrl, upiId: state.upiId }));
    
    const session = getSession(sessionId);

    if (!session) {
        return (
            <CustomerLayout>
                <PageHeader title="Checkout" />
                <div className="flex flex-col items-center justify-center text-center h-[50vh]">
                    <Alert variant="destructive" className="max-w-md">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Session Not Found</AlertTitle>
                        <AlertDescription>
                            The checkout session ID is invalid or has expired. Please try checking out again.
                        </AlertDescription>
                    </Alert>
                    <Link href="/cart">
                        <Button variant="link" className="mt-4">Go back to Cart</Button>
                    </Link>
                </div>
            </CustomerLayout>
        )
    }

    if (!qrCodeUrl && !upiId) {
         return (
             <CustomerLayout>
                <PageHeader title="Checkout" />
                 <div className="flex flex-col items-center justify-center text-center h-[50vh]">
                    <Alert className="max-w-md">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Payment Details Not Configured</AlertTitle>
                        <AlertDescription>
                            The shop owner has not configured payment details yet. Please contact them to complete your purchase.
                        </AlertDescription>
                    </Alert>
                </div>
             </CustomerLayout>
         )
    }
    

    return (
        <CustomerLayout>
            <PageHeader title="Complete Your Payment" />
            <CheckoutSessionDisplay session={session} qrCodeUrl={qrCodeUrl} upiId={upiId} />
        </CustomerLayout>
    )
}
