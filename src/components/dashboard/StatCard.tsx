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
        whileHover={{ y: -5, scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="w-full"
    >
      <Card className={cn(
          "rounded-[1.5rem] sm:rounded-[2rem] border-none shadow-xl h-full text-white overflow-hidden relative",
          isWarning ? "bg-gradient-to-br from-red-500 to-rose-600" : "bg-[#111827] border border-white/5"
      )}>
        {!isWarning && (
            <div className="absolute -bottom-2 -right-2 opacity-5 scale-150 rotate-12">
                {icon}
            </div>
        )}
        <div className="p-4 sm:p-6 relative z-10">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/60">
              {title}
            </h3>
            <div className={cn(
                "p-1.5 sm:p-2 rounded-xl",
                isWarning ? "bg-white/20" : "bg-primary/10 text-primary"
            )}>
                {icon}
            </div>
          </div>
          <div className="pt-2 sm:pt-4">
            <div className="text-lg sm:text-3xl font-black">{value}</div>
            {change && (
              <p className="text-[8px] sm:text-xs mt-1 font-bold text-white/40">
                {change}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}