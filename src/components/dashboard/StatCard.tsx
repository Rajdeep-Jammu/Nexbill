"use client";

import { Card } from "@/components/ui/card";
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
        whileHover={{ y: -5, scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="w-full"
    >
      <Card className={cn(
          "card-3d rounded-[1.5rem] sm:rounded-[2rem] border border-border/50 h-full overflow-hidden relative bg-card",
          isWarning && "bg-gradient-to-br from-red-500 to-rose-600 border-none text-white shadow-red-500/20"
      )}>
        {!isWarning && (
            <div className="absolute -bottom-2 -right-2 opacity-10 scale-150 rotate-12 text-primary">
                {icon}
            </div>
        )}
        <div className="p-4 sm:p-6 relative z-10">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className={cn(
              "text-[10px] sm:text-xs font-black uppercase tracking-widest",
              isWarning ? "text-white/60" : "text-muted-foreground"
            )}>
              {title}
            </h3>
            <div className={cn(
                "p-1.5 sm:p-2 rounded-xl",
                isWarning ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
            )}>
                {icon}
            </div>
          </div>
          <div className="pt-2 sm:pt-4">
            <div className="text-lg sm:text-3xl font-black">{value}</div>
            {change && (
              <p className={cn(
                "text-[8px] sm:text-xs mt-1 font-bold",
                isWarning ? "text-white/40" : "text-muted-foreground"
              )}>
                {change}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}