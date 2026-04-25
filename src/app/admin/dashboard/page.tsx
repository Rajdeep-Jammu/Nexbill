'use client';

import { DollarSign, Package, ShoppingCart, TrendingUp, Eye } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import SalesChart from "@/components/dashboard/SalesChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useMemo } from "react";
import { collection, query } from "firebase/firestore";
import type { Product } from "@/lib/types";

export default function DashboardPage() {
  const shopId = useAuthStore((state) => state.shopId);
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(() => {
    if (!shopId) return null;
    return query(collection(firestore, 'shops', shopId, 'products'));
  }, [firestore, shopId]);
  const { data: products } = useCollection<Product>(productsQuery);

  const billsQuery = useMemoFirebase(() => {
    if (!shopId) return null;
    return query(collection(firestore, 'shops', shopId, 'bills'));
  }, [firestore, shopId]);
  const { data: bills } = useCollection<any>(billsQuery);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysSales = bills?.filter(bill => new Date(bill.billDate) >= today) || [];
    const todaysRevenue = todaysSales.reduce((sum, bill) => sum + bill.totalAmount, 0);

    const totalProducts = products?.length || 0;
    const inventoryValue = products?.reduce((sum, p) => sum + p.price * p.quantity, 0) || 0;
    const lowStockItems = products?.filter(p => p.quantity > 0 && p.quantity <= 10).length || 0;

    return [
      {
        title: "Today's Sales",
        value: `₹${todaysRevenue.toLocaleString()}`,
        change: `${todaysSales.length} bills`,
        icon: <DollarSign className="h-5 w-5 text-primary" />,
      },
      {
        title: "Total Products",
        value: totalProducts,
        change: ``,
        icon: <Package className="h-5 w-5 text-primary" />,
      },
      {
        title: "Inventory Value",
        value: `₹${inventoryValue.toLocaleString()}`,
        change: "",
        icon: <ShoppingCart className="h-5 w-5 text-primary" />,
      },
      {
        title: "Low Stock",
        value: `${lowStockItems} items`,
        change: products?.filter(p => p.quantity === 0).length + " out of stock",
        isWarning: lowStockItems > 0,
        icon: <TrendingUp className="h-5 w-5 text-destructive" />,
      },
    ];
  }, [products, bills]);
  
  return (
    <div>
      <PageHeader title="Dashboard">
        <Link href="/">
          <Button variant="outline">
            <Eye className="mr-2" />
            View Customer App
          </Button>
        </Link>
      </PageHeader>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value.toString()}
            change={stat.change}
            icon={stat.icon}
            isWarning={stat.isWarning}
          />
        ))}
      </div>

      <div className="mt-6 sm:mt-8">
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
      </div>
    </div>
  );
}
