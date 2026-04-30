
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
import { Loader2, ShoppingBag, DollarSign, BarChartHorizontalBig, Hash, ArrowRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import StatCard from '@/components/dashboard/StatCard';
import PurchaseHistoryBillItems from '@/components/profile/PurchaseHistoryBillItems';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Get active shop ID from public config
  const configRef = useMemoFirebase(() => doc(firestore, 'public', 'config'), [firestore]);
  const { data: config } = useDoc(configRef);
  const shopId = (config as any)?.activeShopId;

  // Fetch user's purchase history
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
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <PageHeader title="My Dashboard" />
        <Link href="/">
          <Button className="rounded-full shadow-lg group gap-2">
            Continue Shopping
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        <Card className="bg-gradient-to-br from-primary to-primary-foreground/20 backdrop-blur-lg border-none text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShoppingBag className="h-32 w-32" />
            </div>
            <CardHeader className="flex-row items-center gap-6 space-y-0 relative z-10">
                 <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
                    {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || user.email || 'User'} />}
                    <AvatarFallback className="text-3xl bg-white/10 text-white">{user.displayName ? user.displayName[0].toUpperCase() : (user.email?.[0].toUpperCase() || 'U')}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-3xl md:text-4xl font-headline font-black">Hi, {user.displayName || user.email?.split('@')[0]}!</CardTitle>
                    <CardDescription className="text-white/80 font-medium">{user.email}</CardDescription>
                </div>
            </CardHeader>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StatCard 
                title="Total Spent"
                value={`₹${stats.totalSpent.toLocaleString()}`}
                change="All time"
                icon={<DollarSign className="h-5 w-5" />}
            />
            <StatCard 
                title="Orders"
                value={stats.totalOrders.toString()}
                change="All time"
                icon={<ShoppingBag className="h-5 w-5" />}
            />
             <StatCard 
                title="Items"
                value={stats.totalItems.toString()}
                change="All time"
                icon={<Hash className="h-5 w-5" />}
            />
             <StatCard 
                title="Avg. Order"
                value={`₹${Math.round(stats.avgOrderValue).toLocaleString()}`}
                change="Per order"
                icon={<BarChartHorizontalBig className="h-5 w-5" />}
            />
        </div>

        <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-2xl font-bold">Purchase History</h2>
              {userSales && userSales.length > 0 && (
                <span className="text-sm font-bold text-primary">{userSales.length} Total Records</span>
              )}
            </div>

            {salesLoading ? (
                <Skeleton className="h-48 w-full rounded-[2rem]" />
            ) : userSales && userSales.length > 0 ? (
                <Card className="bg-white rounded-[2rem] border-none shadow-xl overflow-hidden">
                <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                    {userSales.map(sale => (
                        <AccordionItem value={sale.id} key={sale.id} className="border-b last:border-0 border-gray-100">
                        <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between w-full items-center">
                              <div className="text-left">
                                  <p className="font-mono text-sm font-bold text-primary">{sale.invoiceNumber}</p>
                                  <p className="text-xs text-muted-foreground">
                                  {new Date(sale.billDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                  </p>
                              </div>
                              <div className="text-right pr-6">
                                <p className="font-black text-lg">₹{sale.totalAmount.toLocaleString()}</p>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-green-500">Paid</p>
                              </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 bg-gray-50/50">
                            {shopId && <PurchaseHistoryBillItems shopId={shopId} billId={sale.id} />}
                        </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 rounded-[2rem] border-2 border-dashed border-gray-200 bg-white shadow-sm">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-bold mb-4">You haven't made any purchases yet.</p>
                  <Link href="/">
                    <Button variant="outline" className="rounded-full">Shop Now</Button>
                  </Link>
                </div>
            )}
        </div>
      </div>
    </CustomerLayout>
  );
}
