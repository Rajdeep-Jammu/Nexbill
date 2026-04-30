"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type CheckoutSession } from "@/hooks/use-sessions-store";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Copy, Wallet, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";
import { motion } from "framer-motion";

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
        <div className="flex flex-col items-center gap-6 sm:gap-8 pb-10">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm"
            >
                <Card className="text-center bg-card/50 backdrop-blur-xl border-primary/20 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-black flex items-center justify-center gap-2">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Hash className="h-5 w-5" />
                            </div>
                            Share this Code
                        </CardTitle>
                        <CardDescription className="font-bold">Show this 4-digit code to the shopkeeper.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div 
                            className="bg-primary/10 border-4 border-dashed border-primary/30 rounded-3xl p-6 cursor-pointer group hover:bg-primary/20 transition-all"
                            onClick={() => copyToClipboard(session.id, "Code")}
                        >
                            <p className="text-6xl font-mono font-black tracking-[0.2em] text-primary group-hover:scale-110 transition-transform">
                                {session.id}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

             <Card className="w-full max-w-sm text-center bg-card/50 backdrop-blur-xl border-border/50 shadow-xl rounded-[2.5rem] overflow-hidden">
                 <CardHeader>
                    <CardTitle className="text-xl font-black">Scan to Pay</CardTitle>
                    <CardDescription className="font-bold">Amount Due: <span className="text-primary text-lg">₹{session.total.toLocaleString()}</span></CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {qrCodeUrl && (
                        <div className="flex justify-center">
                            <div className="p-4 bg-white rounded-3xl shadow-lg border-4 border-primary/5">
                                <Image
                                    src={qrCodeUrl}
                                    alt="Payment QR Code"
                                    width={220}
                                    height={220}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                    )}
                    {upiId && (
                        <>
                        <Separator className="bg-border/50" />
                        <div className="space-y-3">
                             <p className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2">
                                <Wallet className="h-4 w-4" /> 
                                Merchant UPI ID
                            </p>
                             <div className="flex items-center justify-center gap-2 bg-secondary/50 p-3 rounded-2xl">
                                <p className="font-mono font-bold text-foreground text-sm">{upiId}</p>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => copyToClipboard(upiId, "UPI ID")}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                             </div>
                        </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="text-center space-y-2">
                <p className="text-muted-foreground text-sm font-bold">
                    Once payment is done, the shopkeeper will generate your bill.
                </p>
                <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Status: {session.status}
                </div>
            </div>
        </div>
    )
}
