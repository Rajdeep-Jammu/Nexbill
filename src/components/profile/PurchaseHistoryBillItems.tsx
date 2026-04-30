'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { BillItem } from '@/lib/types';
import { collection, query } from 'firebase/firestore';
import { Loader2, Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

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

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

    if (!items || items.length === 0) {
        return <p className="text-muted-foreground text-sm p-8 font-bold italic text-center">No item details found for this bill.</p>
    }

    const subtotal = items.reduce((acc, item) => acc + item.itemTotal, 0);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-4"
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Package className="h-4 w-4" />
                </div>
                <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground">Order Breakdown</h4>
            </div>
            
            <ul className="space-y-4">
                {items?.map(item => (
                    <li key={item.id} className="flex justify-between items-center bg-background/50 p-4 rounded-2xl border border-border/50 shadow-sm">
                        <div className="space-y-1">
                            <p className="font-black text-base">{item.productName}</p>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest bg-secondary/50 px-2 py-0.5 rounded-full inline-block">
                                Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="font-black text-lg text-primary">₹{item.itemTotal.toLocaleString()}</span>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="pt-4 mt-6 border-t-2 border-dashed border-border/50">
                <div className="flex justify-between items-center p-4 bg-primary/5 rounded-2xl border-2 border-primary/10">
                    <span className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">Grand Total</span>
                    <span className="font-black text-2xl text-primary">₹{subtotal.toLocaleString()}</span>
                </div>
            </div>
        </motion.div>
    );
}
