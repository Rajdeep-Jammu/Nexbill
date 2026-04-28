'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, doc } from 'firebase/firestore';
import type { Bill } from '@/lib/types';

import CustomerLayout from '../customer-layout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag, DollarSign, BarChartHorizontalBig, Hash } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import StatCard from '@/components/dashboard/StatCard';
import PurchaseHistoryBillItems from '@/components/profile/PurchaseHistoryBillItems';

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

  if (!isClient || isUserLoading) {
    return (
      <CustomerLayout>
        <div className="flex h-[60vh] w-full items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CustomerLayout>
    );
  }

  if (!user) {
    return (
      <CustomerLayout>
        <PageHeader title="Dashboard" />
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md text-center p-8 bg-card/50 backdrop-blur-lg border-white/10">
            <CardHeader>
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">Hello, Guest!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Log in or create an account to view your dashboard and manage your details.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/login">
                  <Button>Login</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="secondary">Sign Up</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <PageHeader title="My Dashboard" />
      <div className="space-y-8">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-lg border-white/10">
            <CardHeader className="flex-row items-center gap-6 space-y-0">
                 <Avatar className="h-20 w-20 border-2 border-primary/50">
                    {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || user.email || 'User'} />}
                    <AvatarFallback className="text-3xl">{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-3xl font-headline">Welcome back, {user.displayName || user.email?.split('@')[0]}!</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                </div>
            </CardHeader>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard 
                title="Total Spent"
                value={`₹${stats.totalSpent.toLocaleString()}`}
                change="All time"
                icon={<DollarSign className="h-5 w-5 text-primary" />}
            />
            <StatCard 
                title="Total Orders"
                value={stats.totalOrders.toString()}
                change="All time"
                icon={<ShoppingBag className="h-5 w-5 text-primary" />}
            />
             <StatCard 
                title="Items Purchased"
                value={stats.totalItems.toString()}
                change="All time"
                icon={<Hash className="h-5 w-5 text-primary" />}
            />
             <StatCard 
                title="Avg. Order Value"
                value={`₹${stats.avgOrderValue.toLocaleString()}`}
                change="All time"
                icon={<BarChartHorizontalBig className="h-5 w-5 text-primary" />}
            />
        </div>

        <div>
            <h2 className="font-headline text-2xl font-semibold mb-4">Purchase History</h2>
            {salesLoading ? (
                <Skeleton className="h-48 w-full rounded-2xl" />
            ) : userSales && userSales.length > 0 ? (
                <Card className="bg-card/50 backdrop-blur-lg border-white/10">
                <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                    {userSales.map(sale => (
                        <AccordionItem value={sale.id} key={sale.id}>
                        <AccordionTrigger className="px-4 md:px-6 py-4 hover:no-underline">
                            <div className="flex justify-between w-full items-center">
                            <div className="text-left">
                                <p className="font-mono text-sm">{sale.invoiceNumber}</p>
                                <p className="text-xs text-muted-foreground">
                                {new Date(sale.billDate).toLocaleDateString()}
                                </p>
                            </div>
                            <p className="font-semibold self-center pr-4">₹{sale.totalAmount.toLocaleString()}</p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 md:px-6 pb-4 bg-muted/20">
                            {shopId && <PurchaseHistoryBillItems shopId={shopId} billId={sale.id} />}
                        </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                </CardContent>
                </Card>
            ) : (
                <div className="flex h-48 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50">
                <p className="text-muted-foreground">You haven't made any purchases yet.</p>
                </div>
            )}
        </div>
      </div>
    </CustomerLayout>
  );
}
