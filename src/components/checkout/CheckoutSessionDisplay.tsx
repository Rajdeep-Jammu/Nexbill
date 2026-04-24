"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type CheckoutSession } from "@/hooks/use-sessions-store";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Copy, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";

interface CheckoutSessionDisplayProps {
    session: CheckoutSession;
    qrCodeUrl: string | null;
    upiId: string | null;
}

export default function CheckoutSessionDisplay({ session, qrCodeUrl, upiId }: CheckoutSessionDisplayProps) {
    const { toast } = useToast();

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} Copied!`,
            description: text,
        });
    };

    return (
        <div className="flex flex-col items-center gap-8">
            <Card className="w-full max-w-sm text-center bg-card/50 backdrop-blur-lg border-white/10">
                 <CardHeader>
                    <CardTitle className="text-xl">Show this code to the shopkeeper</CardTitle>
                    <CardDescription>This code contains your cart details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div 
                        className="bg-primary/10 border-2 border-dashed border-primary/50 rounded-xl p-4 cursor-pointer"
                        onClick={() => copyToClipboard(session.id, "Session Code")}
                    >
                        <p className="text-4xl font-mono font-bold tracking-widest text-primary">{session.id}</p>
                    </div>
                </CardContent>
            </Card>

             <Card className="w-full max-w-sm text-center bg-card/50 backdrop-blur-lg border-white/10">
                 <CardHeader>
                    <CardTitle className="text-xl">Scan to Pay</CardTitle>
                    <CardDescription>Complete your payment of ₹{session.total.toLocaleString()} using the QR code or UPI ID.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {qrCodeUrl && (
                        <div className="flex justify-center">
                            <Image
                                src={qrCodeUrl}
                                alt="Payment QR Code"
                                width={200}
                                height={200}
                                className="rounded-lg border-4 border-border"
                            />
                        </div>
                    )}
                    {upiId && (
                        <>
                        <Separator />
                        <div className="space-y-2">
                             <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><Wallet className="h-4 w-4" /> UPI ID</p>
                             <div className="flex items-center justify-center gap-2">
                                <p className="font-mono text-foreground">{upiId}</p>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(upiId, "UPI ID")}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                             </div>
                        </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="text-center text-muted-foreground text-sm">
                <p>Once payment is complete, the shopkeeper will generate your final bill.</p>
                <p>Your session status is currently: <span className="font-semibold text-amber-500">{session.status.toUpperCase()}</span></p>
            </div>
        </div>
    )
}
