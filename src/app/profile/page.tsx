'use client';

import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, doc } from 'firebase/firestore';
import type { Bill } from '@/lib/types';

import CustomerLayout from '../customer-layout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ShoppingBag, DollarSign, BarChartHorizontalBig, Hash, ArrowRight, Zap } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import StatCard from '@/components/dashboard/StatCard';
import PurchaseHistoryBillItems from '@/components/profile/PurchaseHistoryBillItems';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const configRef = useMemoFirebase(() => doc(firestore, 'public', 'config'), [firestore]);
  const { data: config } = useDoc(configRef);
  const shopId = (config as any)?.activeShopId;

  const billsQuery = useMemoFirebase(() => {
    if (!user || !shopId) return null;
    return query(
      collection(firestore, 'shops', shopId, 'bills'),
      where('customerAuthUid', '==', user.uid)
    );
  }, [firestore, user, shopId]);

  const { data: userSales, isLoading: salesLoading } = useCollection<Bill>(billsQuery);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isUserLoading && !user) {
      router.replace('/login');
    }
  }, [isClient, isUserLoading, user, router]);

  const stats = useMemo(() => {
    if (!userSales) return { totalSpent: 0, totalOrders: 0, totalItems: 0, avgOrderValue: 0 };
    const totalSpent = userSales.reduce((acc, bill) => acc + bill.totalAmount, 0);
    const totalOrders = userSales.length;
    const totalItems = userSales.reduce((acc, bill) => acc + (bill.itemCount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    return {
        totalSpent,
        totalOrders,
        totalItems,
        avgOrderValue,
    }
  }, [userSales]);

  if (!isClient || isUserLoading || !user) {
    return (
      <CustomerLayout>
        <div className="flex h-[60vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <PageHeader title="Overview" />
        <Link href="/shop" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto rounded-2xl shadow-xl group gap-2 bg-primary hover:bg-primary/90 glow-primary font-bold">
            <Zap className="h-4 w-4 fill-white" />
            Browse Shop
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-6 sm:space-y-10">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <Card className="bg-gradient-to-br from-indigo-600 via-primary to-emerald-500 backdrop-blur-lg border-none text-white overflow-hidden relative rounded-[2rem] sm:rounded-[3rem] shadow-2xl">
                <div className="absolute -top-10 -right-10 p-8 opacity-10 animate-pulse">
                <ShoppingBag className="h-48 w-48" />
                </div>
                <CardContent className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 p-8 sm:p-12 relative z-10 text-center sm:text-left">
                    <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white/30 shadow-2xl">
                        {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || user.email || 'User'} />}
                        <AvatarFallback className="text-3xl sm:text-5xl bg-white/10 text-white font-black">{user.displayName ? user.displayName[0].toUpperCase() : (user.email?.[0].toUpperCase() || 'U')}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 sm:space-y-2">
                        <h1 className="text-3xl sm:text-6xl font-headline font-black tracking-tight">Hi, {user.displayName || user.email?.split('@')[0]}!</h1>
                        <p className="text-white/80 font-bold text-sm sm:text-xl">{user.email}</p>
                        <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md px-3 py-1 font-bold">Verified User</Badge>
                            <Badge className="bg-emerald-400 text-emerald-950 border-none px-3 py-1 font-black">PRO</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <StatCard 
                title="Total Spent"
                value={`₹${stats.totalSpent.toLocaleString()}`}
                change="Lifetime Value"
                icon={<DollarSign className="h-5 w-5" />}
            />
            <StatCard 
                title="Orders"
                value={stats.totalOrders.toString()}
                change="Completed"
                icon={<ShoppingBag className="h-5 w-5" />}
            />
             <StatCard 
                title="Items"
                value={stats.totalItems.toString()}
                change="Purchased"
                icon={<Hash className="h-5 w-5" />}
            />
             <StatCard 
                title="Avg. Order"
                value={`₹${Math.round(stats.avgOrderValue).toLocaleString()}`}
                change="Ticket Size"
                icon={<BarChartHorizontalBig className="h-5 w-5" />}
            />
        </div>

        <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-xl sm:text-3xl font-black">History</h2>
              {userSales && userSales.length > 0 && (
                <Badge className="bg-primary/20 text-primary border-primary/20 font-bold">{userSales.length} Total</Badge>
              )}
            </div>

            {salesLoading ? (
                <Skeleton className="h-48 w-full rounded-[2rem]" />
            ) : userSales && userSales.length > 0 ? (
                <Card className="bg-[#111827] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
                <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                    {userSales.map(sale => (
                        <AccordionItem value={sale.id} key={sale.id} className="border-b last:border-0 border-white/5">
                        <AccordionTrigger className="px-6 py-6 hover:no-underline hover:bg-white/5 transition-all group">
                            <div className="flex justify-between w-full items-center">
                              <div className="text-left">
                                  <p className="font-mono text-sm font-black text-primary group-hover:text-white transition-colors">{sale.invoiceNumber}</p>
                                  <p className="text-xs text-muted-foreground font-bold">
                                  {new Date(sale.billDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                  </p>
                              </div>
                              <div className="text-right pr-4">
                                <p className="font-black text-lg sm:text-2xl">₹{sale.totalAmount.toLocaleString()}</p>
                                <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-none font-black uppercase tracking-widest">Paid</Badge>
                              </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 bg-white/[0.02]">
                            {shopId && <PurchaseHistoryBillItems shopId={shopId} billId={sale.id} />}
                        </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 rounded-[3rem] border-2 border-dashed border-white/10 bg-white/5 backdrop-blur-sm">
                  <div className="bg-primary/10 p-6 rounded-full mb-6">
                    <ShoppingBag className="h-12 w-12 text-primary opacity-50" />
                  </div>
                  <p className="text-white/60 font-black text-xl mb-6">No drip found yet.</p>
                  <Link href="/shop">
                    <Button variant="outline" className="rounded-full px-8 py-6 font-bold border-white/20 hover:bg-white/10">Start Shopping</Button>
                  </Link>
                </div>
            )}
        </div>
      </div>
    </CustomerLayout>
  );
}