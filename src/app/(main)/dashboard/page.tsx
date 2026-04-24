import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import SalesChart from "@/components/dashboard/SalesChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  // Mock data for demonstration
  const stats = [
    {
      title: "Today's Sales",
      value: "₹12,545",
      change: "+15% from last week",
      icon: <DollarSign className="h-5 w-5 text-primary" />,
    },
    {
      title: "Total Products",
      value: "842",
      change: "+5 new from last week",
      icon: <Package className="h-5 w-5 text-primary" />,
    },
    {
      title: "Inventory Value",
      value: "₹8,34,980",
      change: "",
      icon: <ShoppingCart className="h-5 w-5 text-primary" />,
    },
    {
      title: "Low Stock",
      value: "12 items",
      change: "2 critical",
      isWarning: true,
      icon: <TrendingUp className="h-5 w-5 text-destructive" />,
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
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
              <SalesChart />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
