"use client";

import { Pie, PieChart, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import type { Sale } from "@/hooks/use-sales-store";

interface CategorySalesChartProps {
    sales: Sale[];
}

const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "#3b82f6", // blue-500
    "#10b981", // green-500
    "#f97316", // orange-500
    "#8b5cf6", // violet-500
];

export default function CategorySalesChart({ sales }: CategorySalesChartProps) {
    const data = useMemo(() => {
        const categoryTotals: { [key: string]: number } = {};
        sales.forEach(sale => {
            sale.items.forEach(item => {
                const category = item.category || 'Uncategorized';
                const revenue = item.price * item.cartQuantity;
                if (!categoryTotals[category]) {
                    categoryTotals[category] = 0;
                }
                categoryTotals[category] += revenue;
            });
        });

        return Object.entries(categoryTotals).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

    }, [sales]);

    if (data.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl sm:text-2xl">Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64 sm:h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                    if (percent < 0.05) return null; // Don't render label for small slices
                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                    return (
                                        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                }}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => `₹${value.toLocaleString()}`}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: 'var(--radius)',
                                }}
                            />
                            <Legend wrapperStyle={{fontSize: "0.8rem"}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
