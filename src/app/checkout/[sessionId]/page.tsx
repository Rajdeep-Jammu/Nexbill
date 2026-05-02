"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';

import CustomerLayout from '../../customer-layout';
import CheckoutSessionDisplay from '@/components/checkout/CheckoutSessionDisplay';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function CheckoutPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;
    
    const firestore = useFirestore();
    const sessionRef = useMemoFirebase(() => doc(firestore, 'sessions', sessionId), [firestore, sessionId]);
    const { data: session, isLoading: isSessionLoading, error: sessionError } = useDoc(sessionRef);

    // Fetch Shop Data based on the session's shopId to get Payment Details (QR/UPI)
    const shopId = (session as any)?.shopId;
    const shopRef = useMemoFirebase(() => shopId ? doc(firestore, 'shops', shopId) : null, [firestore, shopId]);
    const { data: shopData, isLoading: isShopLoading } = useDoc(shopRef);

    if (isSessionLoading || (shopId && isShopLoading)) {
        return (
            <CustomerLayout>
                <div className="flex flex-col items-center gap-8 py-10">
                    <Skeleton className="w-full max-w-sm h-40 rounded-[2.5rem]" />
                    <Skeleton className="w-full max-w-sm h-80 rounded-[2.5rem]" />
                </div>
            </CustomerLayout>
        );
    }

    if (!session || sessionError) {
        return (
            <CustomerLayout>
                <div className="flex flex-col items-center justify-center text-center h-[70vh] p-4">
                    <div className="bg-destructive/10 p-6 rounded-full mb-6">
                        <Terminal className="h-12 w-12 text-destructive" />
                    </div>
                    <h2 className="text-3xl font-black mb-2">Session Not Found</h2>
                    <p className="text-muted-foreground max-w-md font-bold mb-8">
                        This checkout code is either invalid, expired, or was already processed.
                    </p>
                    <Link href="/shop">
                        <Button className="rounded-2xl px-8 py-6 font-bold gap-2">
                            <ShoppingBag className="h-5 w-5" />
                            Back to Shopping
                        </Button>
                    </Link>
                </div>
            </CustomerLayout>
        )
    }

    const qrCodeUrl = (shopData as any)?.qrCodeUrl;
    const upiId = (shopData as any)?.upiId;

    if (!qrCodeUrl && !upiId) {
         return (
             <CustomerLayout>
                 <div className="flex flex-col items-center justify-center text-center h-[70vh] p-4">
                    <Alert className="max-w-md rounded-[2rem] border-amber-500/20 bg-amber-500/5">
                        <Terminal className="h-5 w-5 text-amber-500" />
                        <AlertTitle className="font-black text-amber-500">Payment Unconfigured</AlertTitle>
                        <AlertDescription className="font-bold">
                            The shop owner hasn't set up their UPI details in the cloud yet. Please show your checkout code to the staff.
                        </AlertDescription>
                    </Alert>
                    <div className="mt-8">
                        <CheckoutSessionDisplay session={session as any} qrCodeUrl={null} upiId={null} />
                    </div>
                </div>
             </CustomerLayout>
         )
    }
    
    return (
        <CustomerLayout>
            <CheckoutSessionDisplay session={session as any} qrCodeUrl={qrCodeUrl} upiId={upiId} />
        </CustomerLayout>
    )
}