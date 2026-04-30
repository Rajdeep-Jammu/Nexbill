
"use client";

import { useBillingStore } from "@/hooks/use-billing-store";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalAmount, clearCart } = useBillingStore();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Get active shop ID from public config
  const configRef = useMemoFirebase(() => doc(firestore, 'public', 'config'), [firestore]);
  const { data: config } = useDoc(configRef);
  const shopId = (config as any)?.activeShopId;

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
      });
      return;
    }

    if (!shopId) {
      toast({
        variant: "destructive",
        title: "Shop Error",
        description: "Could not identify the active shop. Please try again later.",
      });
      return;
    }

    setIsCheckingOut(true);
    try {
      // Generate a 4-digit numeric code
      const numericId = Math.floor(1000 + Math.random() * 9000).toString();
      const sessionRef = doc(firestore, 'sessions', numericId);

      await setDoc(sessionRef, {
        id: numericId,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          cartQuantity: item.cartQuantity,
          imageUrl: item.imageUrl,
          quantity: item.quantity, // stock info
        })),
        total: totalAmount(),
        status: 'pending',
        shopId: shopId,
        userId: user?.uid || null,
        createdAt: new Date().toISOString(),
      });

      clearCart();
      router.push(`/checkout/${numericId}`);
      
      toast({
        title: "Session Created",
        description: "Your checkout code has been generated.",
      });
    } catch (error: any) {
      console.error("Checkout session creation failed:", error);
      toast({
        variant: "destructive",
        title: "Checkout Failed",
        description: error.message || "Could not create a checkout session.",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };
  
  if (items.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <ShoppingBag className="h-20 w-20 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/shop">
                <Button className="rounded-2xl px-8 py-6 font-bold">Start Shopping</Button>
            </Link>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-lg border-white/10 rounded-[2rem] overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-xl">
                        Cart Items ({items.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-border/50">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-start sm:items-center gap-4 py-4 first:pt-0 last:pb-0">
                        <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="rounded-xl object-cover aspect-square border border-border/50"
                        />
                        <div className="flex-1 space-y-1">
                            <p className="font-bold text-lg">{item.name}</p>
                            <p className="text-sm font-black text-primary">
                            ₹{item.price.toLocaleString()}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}>
                                <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center text-sm font-black">{item.cartQuantity}</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => updateQuantity(item.id, item.cartQuantity + 1)} disabled={item.cartQuantity >= item.quantity}>
                                <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-5 w-5" />
                            </Button>
                        </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <Card className="sticky top-24 bg-card/50 backdrop-blur-lg border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                <CardHeader>
                    <CardTitle className="font-black text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between font-bold">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{totalAmount().toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between font-bold">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-emerald-500 uppercase tracking-widest text-xs py-1">Free</span>
                    </div>
                    <Separator className="bg-border/50" />
                    <div className="flex justify-between items-center">
                        <span className="font-black text-lg">Order Total</span>
                        <span className="font-black text-2xl text-primary">₹{totalAmount().toLocaleString()}</span>
                    </div>
                </CardContent>
                <CardFooter>
                     <Button 
                        className="w-full font-black text-lg py-8 rounded-2xl shadow-xl shadow-primary/20" 
                        size="lg" 
                        onClick={handleCheckout} 
                        disabled={items.length === 0 || isCheckingOut}
                     >
                        {isCheckingOut ? <Loader2 className="animate-spin" /> : 'Confirm Order'}
                     </Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
