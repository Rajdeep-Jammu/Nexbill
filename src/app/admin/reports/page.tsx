'use client';

import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import CategorySalesChart from "@/components/reports/CategorySalesChart";
import { DollarSign, Package, ShoppingCart } from "lucide-react";
import { useMemo } from "react";
import PastBills from "@/components/billing/PastBills";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
    const shopId = useAuthStore(state => state.shopId);
    const firestore = useFirestore();
    const { user } = useUser();

    const billsQuery = useMemoFirebase(() => {
        if (!shopId || !user) return null;
        return query(collection(firestore, 'shops', shopId, 'bills'), where('shopOwnerId', '==', user.uid));
    }, [firestore, shopId, user]);

    const { data: sales, isLoading: billsLoading } = useCollection<any>(billsQuery);

    const billItemsQuery = useMemoFirebase(() => {
        if (!shopId) return null;
        // This is not efficient for large scale, but for this app it's okay.
        // It fetches all billItems for all bills.
        return query(collection(firestore, 'shops', shopId, 'bills'));
    }, [firestore, shopId]);


    const { totalRevenue, totalItemsSold, uniqueProductsSold } = useMemo(() => {
        if (!sales) return { totalRevenue: 0, totalItemsSold: 0, uniqueProductsSold: 0 };
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        // Note: totalItemsSold and uniqueProductsSold would require fetching all billItems,
        // which can be inefficient. For this app, we'll make some assumptions or simplify.
        // Let's assume bills have item counts, or we fetch them.
        const totalItemsSold = sales.reduce((sum, sale) => sum + (sale.itemCount || 0), 0);
        
        // This is complex without all bill items. For now, we'll placeholder this.
        const uniqueProductsSold = 0;

        return { totalRevenue, totalItemsSold, uniqueProductsSold };
    }, [sales]);


    if (billsLoading) {
        return (
             <div>
                <PageHeader title="Reports" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
                    {[...Array(3)].map((_,i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
                </div>
                 <Skeleton className="h-80 w-full rounded-2xl mb-8" />
                 <Skeleton className="h-10 w-48 mb-4" />
                 <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
        )
    }

    if (!sales || sales.length === 0) {
        return (
            <div>
                <PageHeader title="Reports" />
                <div className="flex h-[60vh] items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50">
                    <p className="text-muted-foreground">No sales data yet. Generate a bill to see reports.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader title="Reports" />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
                <StatCard 
                    title="Total Revenue"
                    value={`₹${totalRevenue.toLocaleString()}`}
                    change={`${sales.length} total bills`}
                    icon={<DollarSign className="h-5 w-5 text-primary" />}
                />
                 <StatCard 
                    title="Total Items Sold"
                    value={totalItemsSold.toLocaleString()}
                    change="from all bills"
                    icon={<ShoppingCart className="h-5 w-5 text-primary" />}
                />
                 <StatCard 
                    title="Unique Products Sold"
                    value={"N/A"}
                    change="requires bill items"
                    icon={<Package className="h-5 w-5 text-primary" />}
                />
            </div>

            <div className="mb-6 sm:mb-8">
                {/* This needs BillItems, which is a subcollection. This chart might be complex to implement efficiently.
                For now, let's see if it works with some modifications or if we need a different approach.
                We'll need to fetch all billItems for all bills.
                <CategorySalesChart sales={sales} /> 
                */}
            </div>

            <Separator className="my-8" />
            
            <PastBills sales={sales} />

        </div>
    );
}
