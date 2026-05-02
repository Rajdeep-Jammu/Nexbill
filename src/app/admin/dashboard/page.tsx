'use client';

import { DollarSign, Package, ShoppingCart, TrendingUp, Eye, ArrowUpRight } from "lucide-react";
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
import { motion } from "framer-motion";

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
        change: `${todaysSales.length} bills today`,
        icon: <DollarSign className="h-5 w-5" />,
      },
      {
        title: "Total Products",
        value: totalProducts,
        change: `Live catalog items`,
        icon: <Package className="h-5 w-5" />,
      },
      {
        title: "Inventory Value",
        value: `₹${inventoryValue.toLocaleString()}`,
        change: "Combined stock value",
        icon: <ShoppingCart className="h-5 w-5" />,
      },
      {
        title: "Low Stock",
        value: `${lowStockItems} items`,
        change: products?.filter(p => p.quantity === 0).length + " out of stock",
        isWarning: lowStockItems > 0,
        icon: <TrendingUp className="h-5 w-5" />,
      },
    ];
  }, [products, bills]);
  
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <PageHeader title="Shop Dashboard" />
          <p className="text-muted-foreground font-bold -mt-4">Welcome to your management control center.</p>
        </div>
        <div className="flex gap-2">
            <Link href="/shop">
                <Button variant="outline" className="rounded-xl h-12 font-bold border-primary/20 hover:bg-primary/5">
                    <Eye className="mr-2 h-4 w-4" />
                    Visit Shop
                </Button>
            </Link>
            <Link href="/admin/billing">
                <Button className="rounded-xl h-12 font-black shadow-xl shadow-primary/20">
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    New Bill
                </Button>
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <StatCard
                title={stat.title}
                value={stat.value.toString()}
                change={stat.change}
                icon={stat.icon}
                isWarning={stat.isWarning}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[2.5rem] border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden card-3d">
          <CardHeader>
            <CardTitle className="font-headline text-2xl font-black">
              Weekly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 sm:h-96">
              <SalesChart bills={bills || []} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
            <Card className="rounded-[2.5rem] border-border/50 bg-primary/5 overflow-hidden border-2 border-dashed border-primary/20">
                <CardHeader>
                    <CardTitle className="text-xl font-black">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Link href="/admin/inventory" className="block">
                        <Button variant="outline" className="w-full justify-start h-14 rounded-2xl font-bold gap-3 border-primary/10 hover:bg-primary/10">
                            <Package className="h-5 w-5 text-primary" />
                            Update Stock Levels
                        </Button>
                    </Link>
                    <Link href="/admin/reports" className="block">
                        <Button variant="outline" className="w-full justify-start h-14 rounded-2xl font-bold gap-3 border-primary/10 hover:bg-primary/10">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            View Sales Insights
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-border/50 bg-card/50 overflow-hidden card-3d">
                <CardHeader>
                    <CardTitle className="text-xl font-black">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {bills?.slice(0, 3).map((bill: any) => (
                            <div key={bill.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                                <div>
                                    <p className="text-sm font-black">{bill.invoiceNumber}</p>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">{new Date(bill.billDate).toLocaleDateString()}</p>
                                </div>
                                <span className="font-black text-primary">₹{bill.totalAmount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
