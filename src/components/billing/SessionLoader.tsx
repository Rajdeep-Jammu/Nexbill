"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSessionsStore } from '@/hooks/use-sessions-store';
import { useBillingStore } from '@/hooks/use-billing-store';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2 } from 'lucide-react';

export default function SessionLoader() {
    const [sessionId, setSessionId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const getSession = useSessionsStore(state => state.getSession);
    const loadCart = useBillingStore(state => state.loadCart);
    const { toast } = useToast();

    const handleFetchBill = () => {
        if (!sessionId) {
            toast({ variant: 'destructive', title: 'Please enter a code.' });
            return;
        }

        setIsLoading(true);
        // Simulate network delay
        setTimeout(() => {
            const session = getSession(sessionId.trim());
            if (session) {
                if (session.status === 'paid') {
                     toast({ variant: 'destructive', title: 'Already Processed', description: 'This bill has already been paid.' });
                } else {
                    loadCart(session.items, session.id);
                    toast({ title: 'Bill Loaded', description: `Loaded bill for session ${session.id}.` });
                }
            } else {
                toast({ variant: 'destructive', title: 'Not Found', description: 'No active session found for this 4-digit code.' });
            }
            setIsLoading(false);
            setSessionId('');
        }, 500);
    };

    return (
        <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
                <CardTitle className="text-lg font-black">Load Customer Bill</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input 
                        type="text" 
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="Enter 4-digit code" 
                        value={sessionId}
                        onChange={(e) => setSessionId(e.target.value.replace(/\D/g, ''))}
                        className="font-mono text-center text-xl font-bold tracking-widest h-12"
                    />
                    <Button type="button" onClick={handleFetchBill} disabled={isLoading} className="h-12 px-6 font-bold">
                        {isLoading ? <Loader2 className="animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
                        Fetch
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
