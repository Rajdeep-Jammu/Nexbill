"use client";

import { useBillingStore } from "@/hooks/use-billing-store";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { motion } from "framer-motion";

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
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="bg-primary/10 p-8 rounded-full mb-6">
                <ShoppingBag className="h-20 w-20 text-primary opacity-50" />
              </div>
            </motion.div>
            <h2 className="text-3xl font-black mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-sm font-bold">
              Explore our premium collections and add some high-end items to your cart.
            </p>
            <Link href="/shop">
                <Button className="rounded-2xl px-12 py-7 font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  Browse Products
                </Button>
            </Link>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pb-20">
        <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2.5rem] overflow-hidden card-3d shadow-xl">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="flex items-center gap-3 font-headline text-2xl font-black">
                        <ShoppingBag className="h-7 w-7 text-primary" />
                        My Bag ({items.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 divide-y divide-border/30">
                    {items.map((item, idx) => (
                        <motion.div 
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex flex-col sm:flex-row items-center gap-6 py-6 first:pt-0 last:pb-0 group"
                        >
                          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-border/50 shadow-lg transition-transform group-hover:scale-105">
                            <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                            />
                          </div>
                          <div className="flex-1 text-center sm:text-left space-y-1">
                              <p className="font-black text-xl tracking-tight">{item.name}</p>
                              <div className="flex items-center justify-center sm:justify-start gap-2">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest">{item.category}</Badge>
                                <p className="text-sm font-bold text-muted-foreground">In Stock</p>
                              </div>
                              <p className="text-lg font-black text-primary pt-1">
                                ₹{item.price.toLocaleString()}
                              </p>
                          </div>
                          <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 bg-secondary/80 p-1.5 rounded-2xl border border-border/50 shadow-inner">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 rounded-xl bg-background shadow-sm hover:bg-primary/10 hover:text-primary transition-all" 
                                    onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center text-lg font-black">{item.cartQuantity}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 rounded-xl bg-background shadow-sm hover:bg-primary/10 hover:text-primary transition-all" 
                                    onClick={() => updateQuantity(item.id, item.cartQuantity + 1)} 
                                    disabled={item.cartQuantity >= item.quantity}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-12 w-12 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all" 
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-6 w-6" />
                              </Button>
                          </div>
                        </motion.div>
                    ))}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-4 p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10">
                <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest text-emerald-600">Secure Order</h4>
                  <p className="text-xs font-bold text-muted-foreground mt-1">Your data is encrypted and protected with enterprise security.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10">
                <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest text-indigo-600">Instant Billing</h4>
                  <p className="text-xs font-bold text-muted-foreground mt-1">Get your digital invoice generated immediately after payment.</p>
                </div>
              </div>
            </div>
        </div>

        <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-28"
            >
              <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl card-3d">
                  <CardHeader className="p-8 pb-4">
                      <CardTitle className="font-black text-2xl tracking-tight">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-5">
                      <div className="flex justify-between font-bold text-lg">
                          <span className="text-muted-foreground">Items ({items.length})</span>
                          <span>₹{totalAmount().toLocaleString()}</span>
                      </div>
                       <div className="flex justify-between items-center font-bold">
                          <span className="text-muted-foreground">Shipping</span>
                          <Badge className="bg-emerald-400 text-emerald-950 border-none font-black px-4 py-1.5 rounded-full shadow-md animate-pulse">FREE DELIVERY</Badge>
                      </div>
                      <div className="flex justify-between font-bold">
                          <span className="text-muted-foreground">Est. Tax</span>
                          <span>₹0.00</span>
                      </div>
                      <Separator className="bg-border/30 my-2" />
                      <div className="flex justify-between items-center pt-2">
                          <span className="font-black text-xl uppercase tracking-tighter">Total Due</span>
                          <span className="font-black text-4xl text-primary tracking-tighter">₹{totalAmount().toLocaleString()}</span>
                      </div>
                  </CardContent>
                  <CardFooter className="p-8 pt-0">
                       <Button 
                          className="w-full font-black text-xl py-9 rounded-[1.5rem] shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.03] active:scale-95 glow-primary" 
                          size="lg" 
                          onClick={handleCheckout} 
                          disabled={items.length === 0 || isCheckingOut}
                       >
                          {isCheckingOut ? <Loader2 className="animate-spin h-6 w-6" /> : 'Confirm & Generate Code'}
                       </Button>
                  </CardFooter>
              </Card>
              
              <p className="text-[10px] text-center mt-6 text-muted-foreground font-black uppercase tracking-[0.2em] px-8">
                Confirming generates a 4-digit code for the shopkeeper.
              </p>
            </motion.div>
        </div>
    </div>
  );
}