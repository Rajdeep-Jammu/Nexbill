"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import CustomerLayout from '../../customer-layout';
import PageHeader from "@/components/PageHeader";
import CheckoutSessionDisplay from '@/components/checkout/CheckoutSessionDisplay';
import { useSessionsStore, type CheckoutSession } from '@/hooks/use-sessions-store';
import { useAuthStore } from '@/hooks/use-auth-store';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function CheckoutPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;
    
    // Defer accessing store state until client-side hydration
    const [isLoading, setIsLoading] = useState(true);
    const [session, setSession] = useState<CheckoutSession | undefined>(undefined);
    const [paymentDetails, setPaymentDetails] = useState<{qrCodeUrl: string | null, upiId: string | null}>({qrCodeUrl: null, upiId: null});

    useEffect(() => {
        // This code runs only on the client, after the component has mounted.
        const sessionData = useSessionsStore.getState().getSession(sessionId);
        const { qrCodeUrl, upiId } = useAuthStore.getState();
        setSession(sessionData);
        setPaymentDetails({ qrCodeUrl, upiId });
        setIsLoading(false);
    }, [sessionId]);

    if (isLoading) {
        return (
            <CustomerLayout>
                {/* Render a consistent header during loading */}
                <PageHeader title="Checkout" />
                <div className="flex flex-col items-center gap-8">
                    <Skeleton className="w-full max-w-sm h-40" />
                    <Skeleton className="w-full max-w-sm h-80" />
                </div>
            </CustomerLayout>
        );
    }

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

    if (!paymentDetails.qrCodeUrl && !paymentDetails.upiId) {
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
            <CheckoutSessionDisplay session={session} qrCodeUrl={paymentDetails.qrCodeUrl} upiId={paymentDetails.upiId} />
        </CustomerLayout>
    )
}
