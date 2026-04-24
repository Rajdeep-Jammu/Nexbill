"use client";

import { useBillingStore } from "@/hooks/use-billing-store";
import { useSalesStore } from "@/hooks/use-sales-store";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import BillGeneratedDialog from "./BillGeneratedDialog";
import { useState } from "react";
import type { CartItem } from "@/lib/types";
import { useSessionsStore } from "@/hooks/use-sessions-store";

export default function CurrentBill() {
  const { items, updateQuantity, removeFromCart, totalAmount, clearCart, activeSessionId } = useBillingStore();
  const addSale = useSalesStore((state) => state.addSale);
  const getSession = useSessionsStore(state => state.getSession);
  const updateSessionStatus = useSessionsStore(state => state.updateSessionStatus);
  const [billData, setBillData] = useState<{ items: CartItem[], total: number} | null>(null);

  const handleCheckout = () => {
    setBillData({
        items: items,
        total: totalAmount()
    });
  };
  
  const onDialogClose = () => {
    if (billData) {
      const session = activeSessionId ? getSession(activeSessionId) : undefined;
      addSale({ ...billData, userId: session?.userId });
       if (activeSessionId) {
        updateSessionStatus(activeSessionId, 'paid');
      }
    }
    setBillData(null);
    clearCart();
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl">
          <ShoppingBag className="h-5 w-5" />
          Current Bill
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[40vh] sm:h-[calc(80vh-220px)]">
          {items.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No items in bill yet.</p>
            </div>
          ) : (
            <div className="space-y-4 pr-4">
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
            <div className="w-full flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{totalAmount().toLocaleString()}</span>
            </div>
            <Button className="w-full font-bold" size="lg" onClick={handleCheckout}>Checkout</Button>
        </CardFooter>
      )}
      {billData && <BillGeneratedDialog billData={billData} onClose={onDialogClose} />}
    </Card>
  );
}
