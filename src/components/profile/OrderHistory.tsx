'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Bill } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import PurchaseHistoryBillItems from './PurchaseHistoryBillItems';
import { motion } from 'framer-motion';

export default function OrderHistory() {
  const { user } = useUser();
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collectionGroup(firestore, 'bills'),
      where('customerAuthUid', '==', user.uid),
      orderBy('billDate', 'desc')
    );
  }, [firestore, user]);

  const { data: orders, isLoading } = useCollection<Bill>(ordersQuery);

  if (isLoading) {
    return (
      <Card className="rounded-[2rem] border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="rounded-[2rem] border-border/50 bg-card/50 backdrop-blur-xl card-3d overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-black">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
            Purchase History
          </CardTitle>
          <CardDescription className="font-bold">A record of your premium transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-4">
            {orders.map((order) => (
              <AccordionItem 
                key={order.id} 
                value={order.id}
                className="border-none bg-secondary/30 rounded-[1.5rem] overflow-hidden px-4"
              >
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4 text-left">
                      <div className="p-3 rounded-xl bg-background shadow-sm hidden sm:block">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-black text-sm">{new Date(order.billDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{order.invoiceNumber}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="font-black text-lg text-primary">₹{order.totalAmount.toLocaleString()}</p>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] font-black uppercase px-2 py-0">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                   <PurchaseHistoryBillItems shopId={order.shopId} billId={order.id} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  );
}
