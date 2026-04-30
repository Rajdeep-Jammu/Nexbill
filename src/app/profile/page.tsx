'use client';

import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, doc, orderBy } from 'firebase/firestore';
import type { Bill } from '@/lib/types';

import CustomerLayout from '../customer-layout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ShoppingBag, DollarSign, BarChartHorizontalBig, Hash, ArrowRight, Zap, ShoppingCart } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import StatCard from '@/components/dashboard/StatCard';
import PurchaseHistoryBillItems from '@/components/profile/PurchaseHistoryBillItems';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ProfileDropdown } from '@/components/customer/ProfileDropdown';

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
      where('customerAuthUid', '==', user.uid),
      orderBy('billDate', 'desc')
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
        <PageHeader title="Me" />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/shop" className="flex-1 sm:flex-initial">
            <Button className="w-full sm:w-auto rounded-2xl shadow-xl group gap-2 bg-primary hover:bg-primary/90 glow-primary font-black py-6 px-8">
              <ShoppingCart className="h-5 w-5" />
              Shop Now
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <div className="lg:hidden">
            <ProfileDropdown />
          </div>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-10 pb-10">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <Card className="bg-gradient-to-br from-indigo-600 via-primary to-emerald-500 border-none text-white overflow-hidden relative rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl card-3d">
                <div className="absolute -top-10 -right-10 p-8 opacity-10 animate-pulse">
                <Zap className="h-64 w-64 fill-white" />
                </div>
                <CardContent className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 p-10 sm:p-16 relative z-10 text-center sm:text-left">
                    <Avatar className="h-28 w-28 sm:h-40 sm:w-40 border-4 border-white/30 shadow-2xl ring-4 ring-white/10 ring-offset-4 ring-offset-primary">
                        {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || user.email || 'User'} />}
                        <AvatarFallback className="text-4xl sm:text-6xl bg-white/10 text-white font-black">{user.displayName ? user.displayName[0].toUpperCase() : (user.email?.[0].toUpperCase() || 'U')}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 sm:space-y-4">
                        <h1 className="text-4xl sm:text-7xl font-headline font-black tracking-tighter">Hi, {user.displayName || user.email?.split('@')[0]}!</h1>
                        <p className="text-white/80 font-bold text-base sm:text-2xl">{user.email}</p>
                        <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md px-4 py-1.5 font-bold rounded-full">Member Since 2024</Badge>
                            <Badge className="bg-emerald-400 text-emerald-950 border-none px-4 py-1.5 font-black rounded-full shadow-lg">GOLD STATUS</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <StatCard 
                title="Total Spent"
                value={`₹${stats.totalSpent.toLocaleString()}`}
                change="Lifetime Value"
                icon={<DollarSign className="h-6 w-6" />}
            />
            <StatCard 
                title="Orders"
                value={stats.totalOrders.toString()}
                change="Completed"
                icon={<ShoppingBag className="h-6 w-6" />}
            />
             <StatCard 
                title="Items"
                value={stats.totalItems.toString()}
                change="Purchased"
                icon={<Hash className="h-6 w-6" />}
            />
             <StatCard 
                title="Avg. Order"
                value={`₹${Math.round(stats.avgOrderValue).toLocaleString()}`}
                change="Ticket Size"
                icon={<BarChartHorizontalBig className="h-6 w-6" />}
            />
        </div>

        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-headline text-2xl sm:text-4xl font-black tracking-tight">Order History</h2>
              {userSales && userSales.length > 0 && (
                <Badge className="bg-primary/10 text-primary border-primary/20 font-bold px-4 py-1.5 rounded-full">{userSales.length} Transactions</Badge>
              )}
            </div>

            {salesLoading ? (
                <div className="space-y-4">
                   {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-[2rem]" />)}
                </div>
            ) : userSales && userSales.length > 0 ? (
                <Card className="rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden border-2">
                <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                    {userSales.map(sale => (
                        <AccordionItem value={sale.id} key={sale.id} className="border-b last:border-0 border-border/30 overflow-hidden">
                        <AccordionTrigger className="px-8 py-8 hover:no-underline hover:bg-secondary/50 transition-all group">
                            <div className="flex justify-between w-full items-center">
                              <div className="text-left space-y-1">
                                  <p className="font-mono text-sm font-black text-primary transition-colors group-hover:scale-105 origin-left inline-block">{sale.invoiceNumber}</p>
                                  <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">
                                  {new Date(sale.billDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                  </p>
                              </div>
                              <div className="text-right pr-4 flex items-center gap-4 sm:gap-10">
                                <div className="space-y-1">
                                  <p className="font-black text-xl sm:text-3xl">₹{sale.totalAmount.toLocaleString()}</p>
                                  <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-black uppercase tracking-[0.2em] px-2 py-0">PAID</Badge>
                                </div>
                              </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-8 pb-8 bg-secondary/10">
                            {shopId && <PurchaseHistoryBillItems shopId={shopId} billId={sale.id} />}
                        </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                </CardContent>
                </Card>
            ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-24 rounded-[3rem] border-4 border-dashed border-border/30 bg-card/30 backdrop-blur-sm"
                >
                  <div className="bg-primary/10 p-8 rounded-full mb-8 glow-primary">
                    <ShoppingBag className="h-16 w-16 text-primary opacity-60" />
                  </div>
                  <h3 className="text-2xl font-black mb-2">No drip found yet!</h3>
                  <p className="text-muted-foreground font-bold mb-10 text-center max-w-xs">Your shopping journey starts with your first purchase.</p>
                  <Link href="/shop">
                    <Button className="rounded-full px-12 py-8 font-black text-xl shadow-2xl hover:scale-105 transition-transform bg-primary">Start Shopping</Button>
                  </Link>
                </motion.div>
            )}
        </div>
      </div>
    </CustomerLayout>
  );
}
