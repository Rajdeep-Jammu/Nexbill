'use client';

import PageHeader from "@/components/PageHeader";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Bill } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import SalesChart from "@/components/dashboard/SalesChart";
import PastBills from "@/components/billing/PastBills";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
    const shopId = useAuthStore((state) => state.shopId);
    const firestore = useFirestore();

    const billsQuery = useMemoFirebase(() => {
        if (!shopId) return null;
        return query(collection(firestore, 'shops', shopId, 'bills'));
    }, [firestore, shopId]);

    const { data: bills, isLoading } = useCollection<Bill>(billsQuery);

    if (isLoading) {
        return (
            <div>
                <PageHeader title="Reports" />
                <div className="grid gap-8">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-48" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-80 w-full" />
                        </CardContent>
                    </Card>
                    <div>
                        <Skeleton className="h-8 w-36 mb-4" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader title="Reports" />
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl sm:text-2xl">
                        Weekly Sales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 sm:h-80">
                        <SalesChart bills={bills || []} />
                        </div>
                    </CardContent>
                </Card>
                
                <PastBills sales={bills || []} />
            </div>
        </div>
    );
}
