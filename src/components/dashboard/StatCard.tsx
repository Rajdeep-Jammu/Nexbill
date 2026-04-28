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
      <Card className={cn(
          "rounded-2xl shadow-lg h-full text-white",
          isWarning ? "bg-gradient-to-br from-amber-500 to-destructive" : "bg-gradient-to-br from-primary/80 to-primary"
      )}>
        <div className="p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-white/90">
              {title}
            </h3>
            <div className="text-white/90">{icon}</div>
          </div>
          <div className="pt-0">
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <p className="text-xs mt-1 text-white/80">
                {change}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
