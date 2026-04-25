'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Bill, BillItem } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useAuthStore } from '@/hooks/use-auth-store';
import { collection, query, doc, deleteDoc } from 'firebase/firestore';

interface PastBillsProps {
    sales: Bill[];
}

function BillItems({ shopId, billId }: { shopId: string, billId: string }) {
    const firestore = useFirestore();
    const itemsQuery = useMemoFirebase(() => {
        return query(collection(firestore, 'shops', shopId, 'bills', billId, 'billItems'));
    }, [firestore, shopId, billId]);
    
    const { data: items, isLoading } = useCollection<BillItem>(itemsQuery);

    if (isLoading) return <Loader2 className="animate-spin my-4 mx-auto" />;

    return (
        <ul className="space-y-2 text-sm pl-4 pt-2">
            {items?.map(item => (
                <li key={item.id} className="flex justify-between">
                    <span>{item.productName} x {item.quantity}</span>
                    <span className="text-muted-foreground">₹{(item.unitPrice * item.quantity).toLocaleString()}</span>
                </li>
            ))}
        </ul>
    );
}


export default function PastBills({ sales }: PastBillsProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { shopId } = useAuthStore();
  const [billToDelete, setBillToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (billToDelete && shopId) {
      try {
        // Note: Deleting subcollections is not handled here. For a production app,
        // you would need a Cloud Function to recursively delete subcollections.
        await deleteDoc(doc(firestore, 'shops', shopId, 'bills', billToDelete));
        toast({
          title: "Sale Deleted",
          description: "The sale has been removed from history.",
        });
      } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Delete failed",
            description: error.message
        })
      } finally {
        setBillToDelete(null);
      }
    }
  };

  if (sales.length === 0) {
    return (
      <div>
        <h2 className="font-headline text-xl font-semibold mb-4">Sales History</h2>
        <div className="flex h-24 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50">
          <p className="text-muted-foreground">No sales have been recorded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <h2 className="font-headline text-xl font-semibold mb-4">Sales History</h2>
        <Accordion type="single" collapsible className="w-full">
          {sales.map(sale => (
            <AccordionItem value={sale.id} key={sale.id}>
              <AccordionTrigger>
                <div className="flex justify-between w-full pr-4 text-sm">
                  <span className="font-mono">{sale.invoiceNumber}</span>
                  <span className="text-muted-foreground">
                    {new Date(sale.billDate).toLocaleString()}
                  </span>
                  <span className="font-semibold">₹{sale.totalAmount.toLocaleString()}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className='bg-muted/30 p-4 rounded-md'>
                    <BillItems shopId={shopId!} billId={sale.id} />
                    <div className="flex justify-end items-center gap-2 pt-4 mt-4 border-t border-border">
                    <Button variant="destructive" size="sm" onClick={() => setBillToDelete(sale.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                    </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <AlertDialog open={!!billToDelete} onOpenChange={open => !open && setBillToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this sale record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the sale record from your history. Sub-items will not be deleted automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBillToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
