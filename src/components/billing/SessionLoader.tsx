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
            toast({ variant: 'destructive', title: 'Please enter a session code.' });
            return;
        }

        setIsLoading(true);
        // Simulate network delay
        setTimeout(() => {
            const session = getSession(sessionId.toUpperCase());
            if (session) {
                if (session.status === 'paid') {
                     toast({ variant: 'destructive', title: 'Session Already Processed', description: 'This bill has already been paid and processed.' });
                } else {
                    loadCart(session.items, session.id);
                    toast({ title: 'Bill Loaded', description: `Loaded bill for session ${session.id}.` });
                }
            } else {
                toast({ variant: 'destructive', title: 'Session Not Found', description: 'No active session found for the provided code.' });
            }
            setIsLoading(false);
            setSessionId('');
        }, 500);
    };

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Load Customer Bill</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input 
                        type="text" 
                        placeholder="Enter session code..." 
                        value={sessionId}
                        onChange={(e) => setSessionId(e.target.value)}
                        className="font-mono"
                    />
                    <Button type="button" onClick={handleFetchBill} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Fetch Bill
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
