"use client";

import { useBillingStore } from "@/hooks/use-billing-store";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useSessionsStore } from "@/hooks/use-sessions-store";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalAmount, clearCart } = useBillingStore();
  const { toast } = useToast();
  const createSession = useSessionsStore((state) => state.createSession);
  const router = useRouter();
  const { user } = useUser();

  const handleCheckout = () => {
    if (items.length > 0) {
        const session = createSession(items, totalAmount(), user?.uid);
        clearCart();
        router.push(`/checkout/${session.id}`);
    } else {
        toast({
            variant: "destructive",
            title: "Cart is empty",
            description: "Please add items to your cart before checking out.",
        });
    }
  };
  
  if (items.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <ShoppingBag className="h-20 w-20 text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/">
                <Button>Start Shopping</Button>
            </Link>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-lg border-white/10">
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
                            className="rounded-lg object-cover aspect-square border border-border/50"
                        />
                        <div className="flex-1 space-y-1">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                            ₹{item.price.toLocaleString()}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}>
                                <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center text-sm font-bold">{item.cartQuantity}</span>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.cartQuantity + 1)} disabled={item.cartQuantity >= item.quantity}>
                                <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <Card className="sticky top-24 bg-card/50 backdrop-blur-lg border-white/10">
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{totalAmount().toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-medium text-primary">Free</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Order Total</span>
                        <span>₹{totalAmount().toLocaleString()}</span>
                    </div>
                </CardContent>
                <CardFooter>
                     <Button className="w-full font-bold" size="lg" onClick={handleCheckout} disabled={items.length === 0}>Proceed to Checkout</Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
