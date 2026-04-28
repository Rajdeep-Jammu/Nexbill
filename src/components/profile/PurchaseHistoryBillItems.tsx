'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { BillItem } from '@/lib/types';
import { collection, query } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PurchaseHistoryBillItemsProps {
    shopId: string;
    billId: string;
}

export default function PurchaseHistoryBillItems({ shopId, billId }: PurchaseHistoryBillItemsProps) {
    const firestore = useFirestore();
    const itemsQuery = useMemoFirebase(() => {
        return query(collection(firestore, 'shops', shopId, 'bills', billId, 'billItems'));
    }, [firestore, shopId, billId]);
    
    const { data: items, isLoading } = useCollection<BillItem>(itemsQuery);

    if (isLoading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin my-4" /></div>;

    if (!items || items.length === 0) {
        return <p className="text-muted-foreground text-sm p-4">No item details found for this bill.</p>
    }

    const subtotal = items.reduce((acc, item) => acc + item.itemTotal, 0);

    return (
        <div className="space-y-3">
            <h4 className="font-semibold text-sm">Items Purchased</h4>
            <ul className="space-y-2 text-sm">
                {items?.map(item => (
                    <li key={item.id} className="flex justify-between items-center">
                        <div>
                            <p>{item.productName}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity} @ ₹{item.unitPrice.toLocaleString()}</p>
                        </div>
                        <span className="font-medium">₹{item.itemTotal.toLocaleString()}</span>
                    </li>
                ))}
            </ul>
            <Separator />
            <div className="flex justify-end font-bold">
                 <p>Total: ₹{subtotal.toLocaleString()}</p>
            </div>
        </div>
    );
}
