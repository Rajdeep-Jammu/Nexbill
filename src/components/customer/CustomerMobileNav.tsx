"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  ShoppingCart,
  LayoutDashboard,
  Settings,
  LogIn,
} from "lucide-react";
import { motion } from "framer-motion";
import { useBillingStore } from "@/hooks/use-billing-store";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/firebase";

import { cn } from "@/lib/utils";

export default function CustomerMobileNav() {
  const pathname = usePathname();
  const { totalItems } = useBillingStore();
  const { user, isUserLoading } = useUser();
  const cartItemCount = totalItems();

  if (isUserLoading) return null;

  const navItems = user 
    ? [
        { href: "/profile", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/shop", icon: ShoppingBag, label: "Shop" },
        { href: "/cart", icon: ShoppingCart, label: "Cart", count: cartItemCount },
        { href: "/settings", icon: Settings, label: "Settings" }
      ]
    : [
        { href: "/shop", icon: ShoppingBag, label: "Shop" },
        { href: "/cart", icon: ShoppingCart, label: "Cart", count: cartItemCount },
        { href: "/login", icon: LogIn, label: "Login" }
      ];

  const isActive = (href: string) => pathname === href;
  
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-6 left-6 right-6 h-18 bg-background/70 backdrop-blur-3xl border border-white/10 dark:border-white/5 rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] z-50 lg:hidden"
    >
      <nav className="flex h-full items-center justify-around px-2 relative">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center h-full w-full relative z-10"
          >
            <motion.div 
              whileTap={{ scale: 0.85 }}
              className={cn(
                "p-3 rounded-2xl transition-all duration-300",
                isActive(item.href) ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 transition-all duration-500",
                  isActive(item.href) ? "scale-110" : "scale-100"
                )}
              />
              {item.count && item.count > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute top-2 right-2 h-5 w-5 justify-center p-0 border-2 border-background animate-pulse shadow-lg"
                >
                  {item.count}
                </Badge>
              )}
            </motion.div>
            
            {isActive(item.href) && (
              <motion.div
                layoutId="active-nav-bg"
                className="absolute inset-x-2 inset-y-2 bg-primary/10 rounded-2xl -z-10"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </Link>
        ))}
      </nav>
    </motion.div>
  );
}