"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartTooltipContent,
} from "@/components/ui/chart";

const data = [
  { day: "Mon", sales: 4000 },
  { day: "Tue", sales: 3000 },
  { day: "Wed", sales: 2000 },
  { day: "Thu", sales: 2780 },
  { day: "Fri", sales: 1890 },
  { day: "Sat", sales: 2390 },
  { day: "Sun", sales: 3490 },
];

export default function SalesChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
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
          tickFormatter={(value) => `₹${value / 1000}k`}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--secondary))', radius: 'var(--radius)' }}
          content={<ChartTooltipContent
            formatter={(value) => `₹${value.toLocaleString()}`}
            indicator="dot"
            labelClassName="font-bold"
            className="rounded-lg border-border bg-background/80 backdrop-blur-sm"
          />}
        />
        <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
