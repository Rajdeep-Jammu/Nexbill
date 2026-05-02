'use client';

import { useBillingStore } from '@/hooks/use-billing-store';
import { useAuthStore } from '@/hooks/use-auth-store';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import BillGeneratedDialog from './BillGeneratedDialog';
import { useState } from 'react';
import type { CartItem, Bill, BillItem } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function CurrentBill() {
  const { items, updateQuantity, removeFromCart, totalAmount, clearCart, activeSessionId } = useBillingStore();
  const { shopId: currentShopId, shopOwnerId } = useAuthStore();
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
    if (!billData || !currentShopId || !shopOwnerId) return;

    setIsCheckingOut(true);

    try {
      const batch = writeBatch(firestore);

      // 1. Create Bill document
      const billRef = doc(collection(firestore, 'shops', currentShopId, 'bills'));
      const bill: Bill = {
        id: billRef.id,
        shopId: currentShopId,
        shopOwnerId: shopOwnerId,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        billDate: new Date().toISOString(),
        subtotal: billData.total,
        taxAmount: 0,
        totalAmount: billData.total,
        status: 'paid',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        itemCount: billData.items.reduce((sum, item) => sum + item.cartQuantity, 0),
      };
      
      batch.set(billRef, bill);

      // 2. Create BillItem documents & Update Inventory
      for (const item of billData.items) {
        const billItemRef = doc(collection(firestore, 'shops', currentShopId, 'bills', billRef.id, 'billItems'));
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
          shopOwnerId: shopOwnerId,
        };
        batch.set(billItemRef, billItem);

        // Safety: Ensure the product actually exists before updating stock
        // This prevents "No document to update" errors if the product was deleted
        const productRef = doc(firestore, 'shops', currentShopId, 'products', item.id);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
            const currentStock = productSnap.data().quantity || 0;
            batch.update(productRef, {
                quantity: Math.max(0, currentStock - item.cartQuantity)
            });
        }
      }
      
      // 3. Mark session as paid
      if (activeSessionId) {
        const sessionRef = doc(firestore, 'sessions', activeSessionId);
        const sessionSnap = await getDoc(sessionRef);
        if (sessionSnap.exists()) {
            batch.update(sessionRef, { status: 'paid' });
        }
      }

      await batch.commit();

      toast({
        title: "Bill Processed!",
        description: "Transaction saved and inventory updated."
      });

    } catch (error: any) {
        console.error("Failed to save bill:", error);
        toast({
            variant: 'destructive',
            title: "Checkout Failed",
            description: error.message || "Could not save the bill."
        });
    } finally {
        setIsCheckingOut(false);
        setBillData(null);
        clearCart();
    }
  };

  return (
    <Card className="sticky top-4 rounded-[2rem] border-primary/20 overflow-hidden shadow-2xl bg-card/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-black text-xl">
          <ShoppingBag className="h-5 w-5 text-primary" />
          Live Bill
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[40vh] sm:h-[calc(80vh-220px)]">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-10 opacity-50">
              <ShoppingBag className="h-10 w-10 mb-2" />
              <p className="text-sm font-bold">No items loaded.</p>
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-4 bg-secondary/30 p-2 rounded-2xl">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-primary/10">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black truncate">{item.name}</p>
                    <p className="text-xs font-bold text-primary">
                      ₹{item.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg bg-background shadow-sm"
                      onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-5 text-center text-sm font-black">{item.cartQuantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg bg-background shadow-sm"
                      onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                      disabled={item.cartQuantity >= item.quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg"
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
        <CardFooter className="flex-col items-start gap-4 border-t pt-6">
          <div className="w-full flex justify-between items-center">
            <span className="font-black text-muted-foreground uppercase tracking-widest text-xs">Total Due</span>
            <span className="font-black text-2xl text-primary">₹{totalAmount().toLocaleString()}</span>
          </div>
          <Button className="w-full font-black text-lg py-8 rounded-2xl shadow-xl shadow-primary/20" size="lg" onClick={handleCheckout} disabled={isCheckingOut}>
            {isCheckingOut ? <Loader2 className="animate-spin" /> : 'Finalize Sale'}
          </Button>
        </CardFooter>
      )}
      {billData && <BillGeneratedDialog billData={billData} onClose={onDialogClose} />}
    </Card>
  );
}