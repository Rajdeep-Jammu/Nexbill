'use client';

import { useBillingStore } from '@/hooks/use-billing-store';
import { useAuthStore } from '@/hooks/use-auth-store';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import BillGeneratedDialog from './BillGeneratedDialog';
import { useState } from 'react';
import type { CartItem, Bill, BillItem } from '@/lib/types';
import { useSessionsStore } from '@/hooks/use-sessions-store';
import { useFirestore } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function CurrentBill() {
  const { items, updateQuantity, removeFromCart, totalAmount, clearCart, activeSessionId } = useBillingStore();
  const { shopId, shopOwnerId } = useAuthStore();
  const getSession = useSessionsStore(state => state.getSession);
  const updateSessionStatus = useSessionsStore(state => state.updateSessionStatus);
  const [billData, setBillData] = useState<{ items: CartItem[]; total: number } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleCheckout = () => {
    setBillData({
      items: items,
      total: totalAmount(),
    });
  };

  const onDialogClose = async () => {
    if (!billData || !shopId || !shopOwnerId) return;

    setIsCheckingOut(true);

    try {
      const session = activeSessionId ? getSession(activeSessionId) : undefined;

      // Create a batch write
      const batch = writeBatch(firestore);

      // 1. Create Bill document
      const billRef = doc(collection(firestore, 'shops', shopId, 'bills'));
      const bill: Bill = {
        id: billRef.id,
        shopId,
        shopOwnerId: shopOwnerId,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        billDate: new Date().toISOString(),
        subtotal: billData.total, // Assuming total is subtotal for now
        taxAmount: 0,
        totalAmount: billData.total,
        status: 'paid',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        itemCount: billData.items.reduce((sum, item) => sum + item.cartQuantity, 0),
      };
       if (session?.userId) {
        (bill as any).customerAuthUid = session.userId;
      }
      batch.set(billRef, bill);

      // 2. Create BillItem documents
      for (const item of billData.items) {
        const billItemRef = doc(collection(firestore, 'shops', shopId, 'bills', billRef.id, 'billItems'));
        const billItem: BillItem = {
          id: billItemRef.id,
          billId: billRef.id,
          productId: item.id,
          productName: item.name,
          quantity: item.cartQuantity,
          unitPrice: item.price,
          itemTotal: item.price * item.cartQuantity,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          shopOwnerId: shopOwnerId, // Denormalizing for rules
          ...(session?.userId && { customerAuthUid: session.userId }),
        };
        batch.set(billItemRef, billItem);

        // 3. (Optional but good practice) Update product inventory
        const productRef = doc(firestore, 'shops', shopId, 'products', item.id);
        batch.update(productRef, {
            quantity: item.quantity - item.cartQuantity
        });
      }
      
      // Commit the batch
      await batch.commit();

      if (activeSessionId) {
        updateSessionStatus(activeSessionId, 'paid');
      }

      toast({
        title: "Bill Saved!",
        description: "The transaction has been recorded."
      })

    } catch (error: any) {
        console.error("Failed to save bill:", error);
        toast({
            variant: 'destructive',
            title: "Checkout Failed",
            description: error.message || "Could not save the bill to the database."
        })
    } finally {
        setIsCheckingOut(false);
        setBillData(null);
        clearCart();
    }
  };

  return (
    <Card className="sticky top-4 bg-card/50 backdrop-blur-lg border-white/10">
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
              {items.map(item => (
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
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-5 text-center text-sm">{item.cartQuantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                      disabled={item.cartQuantity >= item.quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
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
          <Button className="w-full font-bold" size="lg" onClick={handleCheckout} disabled={isCheckingOut}>
            {isCheckingOut ? <Loader2 className="animate-spin" /> : 'Checkout'}
          </Button>
        </CardFooter>
      )}
      {billData && <BillGeneratedDialog billData={billData} onClose={onDialogClose} />}
    </Card>
  );
}
