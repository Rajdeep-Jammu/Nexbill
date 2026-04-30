
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useBillingStore } from '@/hooks/use-billing-store';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function SessionLoader() {
    const [sessionId, setSessionId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const loadCart = useBillingStore(state => state.loadCart);
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleFetchBill = async () => {
        if (!sessionId || sessionId.length < 4) {
            toast({ variant: 'destructive', title: 'Please enter a 4-digit code.' });
            return;
        }

        setIsLoading(true);
        try {
            const sessionRef = doc(firestore, 'sessions', sessionId.trim());
            const sessionSnap = await getDoc(sessionRef);
            
            if (sessionSnap.exists()) {
                const session = sessionSnap.data();
                if (session.status === 'paid') {
                     toast({ 
                        variant: 'destructive', 
                        title: 'Already Processed', 
                        description: 'This bill has already been paid.' 
                    });
                } else {
                    loadCart(session.items, session.id);
                    toast({ 
                        title: 'Bill Loaded', 
                        description: `Loaded bill for session ${session.id}.` 
                    });
                }
            } else {
                toast({ 
                    variant: 'destructive', 
                    title: 'Not Found', 
                    description: 'No active session found for this code.' 
                });
            }
        } catch (error: any) {
            console.error("Error fetching session:", error);
            toast({
                variant: 'destructive',
                title: 'Fetch Error',
                description: 'Could not connect to the database. Please try again.'
            });
        } finally {
            setIsLoading(false);
            setSessionId('');
        }
    };

    return (
        <Card className="mb-8 border-primary/20 bg-primary/5 rounded-[2rem] overflow-hidden shadow-xl">
            <CardHeader>
                <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    Load Customer Session
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex w-full max-w-md items-center space-x-3">
                    <Input 
                        type="text" 
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="0000" 
                        value={sessionId}
                        onChange={(e) => setSessionId(e.target.value.replace(/\D/g, ''))}
                        className="font-mono text-center text-3xl font-black tracking-[0.3em] h-16 rounded-2xl bg-background border-primary/20"
                    />
                    <Button 
                        type="button" 
                        onClick={handleFetchBill} 
                        disabled={isLoading || sessionId.length < 4} 
                        className="h-16 px-8 font-black text-lg rounded-2xl shadow-lg"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Fetch Bill'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
