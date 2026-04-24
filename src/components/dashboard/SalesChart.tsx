'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { useMemo } from 'react';
import type { Bill } from '@/lib/types';

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function SalesChart({ bills }: { bills: Bill[] }) {
  const data = useMemo(() => {
    const weeklySales: { [key: string]: number } = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const dayMapping = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const oneWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);

    bills
        .filter(bill => new Date(bill.billDate) >= oneWeekAgo)
        .forEach(bill => {
            const dayOfWeek = dayMapping[new Date(bill.billDate).getDay()];
            weeklySales[dayOfWeek] += bill.totalAmount;
        });

    return Object.entries(weeklySales).map(([day, sales]) => ({ day, sales }));

  }, [bills]);

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
          <XAxis
            dataKey="day"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={value => `₹${value / 1000}k`}
          />
          <ChartTooltip
            cursor={{ fill: 'hsl(var(--secondary))', radius: 'var(--radius)' }}
            content={
              <ChartTooltipContent
                formatter={value => `₹${value.toLocaleString()}`}
                indicator="dot"
                labelClassName="font-bold"
                className="rounded-lg border-border bg-background/80 backdrop-blur-sm"
              />
            }
          />
          <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
