"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/inventory", icon: Boxes, label: "Inventory" },
  { href: "/billing", icon: FileText, label: "Billing" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50"
    >
      <nav className="flex h-full items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center h-full w-full"
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <item.icon
                className={cn(
                  "h-6 w-6 transition-colors",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              />
            </motion.div>
            {pathname === item.href && (
              <motion.div
                layoutId="active-indicator"
                className="absolute bottom-1 h-1 w-6 rounded-full bg-primary"
              />
            )}
          </Link>
        ))}
      </nav>
    </motion.div>
  );
}
