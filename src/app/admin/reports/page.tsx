'use client';

import { useSalesStore, type Sale } from "@/hooks/use-sales-store";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import CategorySalesChart from "@/components/reports/CategorySalesChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart } from "lucide-react";
import { useMemo } from "react";
import PastBills from "@/components/billing/PastBills";
import { Separator } from "@/components/ui/separator";

export default function ReportsPage() {
    const sales = useSalesStore((state) => state.sales);

    const { totalRevenue, totalItemsSold, uniqueProductsSold } = useMemo(() => {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalItemsSold = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.cartQuantity, 0), 0);
        const uniqueProductsSold = new Set(sales.flatMap(sale => sale.items.map(item => item.id))).size;
        return { totalRevenue, totalItemsSold, uniqueProductsSold };
    }, [sales]);

    const allItemsSold = useMemo(() => {
        const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>();
        sales.forEach(sale => {
            sale.items.forEach(item => {
                const existing = itemMap.get(item.id);
                if (existing) {
                    existing.quantity += item.cartQuantity;
                    existing.revenue += item.price * item.cartQuantity;
                } else {
                    itemMap.set(item.id, {
                        name: item.name,
                        quantity: item.cartQuantity,
                        revenue: item.price * item.cartQuantity,
                    });
                }
            });
        });
        return Array.from(itemMap.values()).sort((a,b) => b.revenue - a.revenue);
    }, [sales]);

    if (sales.length === 0) {
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
                    change=""
                    icon={<DollarSign className="h-5 w-5 text-primary" />}
                />
                 <StatCard 
                    title="Total Items Sold"
                    value={totalItemsSold.toLocaleString()}
                    change=""
                    icon={<ShoppingCart className="h-5 w-5 text-primary" />}
                />
                 <StatCard 
                    title="Unique Products Sold"
                    value={uniqueProductsSold.toLocaleString()}
                    change=""
                    icon={<Package className="h-5 w-5 text-primary" />}
                />
            </div>

            <div className="mb-6 sm:mb-8">
                <CategorySalesChart sales={sales} />
            </div>

            <div className="mb-8">
                <h2 className="font-headline text-xl sm:text-2xl font-semibold text-foreground mb-4">
                    Product Sales Breakdown
                </h2>
                <Card className="overflow-hidden bg-card/50 backdrop-blur-lg border-white/10">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-center">Quantity Sold</TableHead>
                                    <TableHead className="text-right">Total Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allItemsSold.map(item => (
                                    <TableRow key={item.name}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right">₹{item.revenue.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
            
            <Separator className="my-8" />
            
            <PastBills />

        </div>
    );
}
