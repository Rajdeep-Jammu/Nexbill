"use client";

import { useBillingStore } from "@/hooks/use-billing-store";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalAmount, clearCart } = useBillingStore();
  const { toast } = useToast();

  const handleCheckout = () => {
    // For now, just clears the cart and shows a success message.
    // The full session code flow will be implemented later.
    if (items.length > 0) {
        toast({
            title: "Checkout Successful!",
            description: "Your order has been placed.",
        });
        clearCart();
    } else {
        toast({
            variant: "destructive",
            title: "Cart is empty",
            description: "Please add items to your cart before checking out.",
        });
    }
  };

  return (
    <Card className="sticky top-4 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl">
          <ShoppingBag className="h-5 w-5" />
          Your Cart
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[45vh] pr-4">
          {items.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Your cart is empty.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="rounded-md object-cover aspect-square"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ₹{item.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-5 text-center text-sm">{item.cartQuantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.cartQuantity + 1)} disabled={item.cartQuantity >= item.quantity}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      {items.length > 0 && (
        <CardFooter className="flex-col items-start gap-4">
            <Separator />
            <div className="w-full flex justify-between font-bold text-lg mt-2">
                <span>Total</span>
                <span>₹{totalAmount().toLocaleString()}</span>
            </div>
            <Button className="w-full font-bold" size="lg" onClick={handleCheckout}>Checkout</Button>
        </CardFooter>
      )}
    </Card>
  );
}
