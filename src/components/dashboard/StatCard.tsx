"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  isWarning?: boolean;
};

export default function StatCard({
  title,
  value,
  change,
  icon,
  isWarning = false,
}: StatCardProps) {
  return (
    <motion.div 
        whileHover={{ y: -8, scale: 1.05, rotateZ: 2 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="w-full"
    >
      <Card className="rounded-2xl border-white/10 bg-card/50 shadow-xl backdrop-blur-lg h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold text-foreground">{value}</div>
          {change && (
            <p
              className={cn(
                "text-xs mt-1",
                isWarning ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
