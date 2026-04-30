
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
      className="fixed bottom-6 left-6 right-6 h-16 bg-background/80 backdrop-blur-2xl border border-border rounded-[2rem] shadow-2xl z-50 lg:hidden glow-primary"
    >
      <nav className="flex h-full items-center justify-around px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center h-full w-full relative"
          >
            <motion.div 
              whileTap={{ scale: 0.8 }}
              className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive(item.href) ? "bg-primary/10" : "bg-transparent"
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 transition-all",
                  isActive(item.href) ? "text-primary scale-110" : "text-muted-foreground"
                )}
              />
              {item.count && item.count > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 border-2 border-background animate-bounce"
                >
                  {item.count}
                </Badge>
              )}
            </motion.div>
            {isActive(item.href) && (
              <motion.div
                layoutId="customer-nav-dot"
                className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary"
              />
            )}
          </Link>
        ))}
      </nav>
    </motion.div>
  );
}
