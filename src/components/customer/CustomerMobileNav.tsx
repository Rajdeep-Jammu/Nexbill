"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  ShoppingCart,
  LayoutDashboard,
  Settings,
  Shield,
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
  const { user, isUserLoading, isAdmin } = useUser();
  const cartItemCount = totalItems();

  let navItems = [];
  
  if (isUserLoading) {
    return null; // Don't render anything while auth state is resolving
  }

  if (user) {
    navItems.push(
      { href: "/profile", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/", icon: ShoppingBag, label: "Products" },
      { href: "/cart", icon: ShoppingCart, label: "Cart", count: cartItemCount }
    );
     if (isAdmin) {
      navItems.push({ href: "/admin/login", icon: Shield, label: "Admin" });
    }
    navItems.push({ href: "/settings", icon: Settings, label: "Settings" });
  } else {
     navItems.push(
      { href: "/", icon: ShoppingBag, label: "Products" },
      { href: "/cart", icon: ShoppingCart, label: "Cart", count: cartItemCount },
      { href: "/login", icon: LogIn, label: "Login" }
    );
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };
  
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="fixed bottom-4 left-4 right-4 h-16 bg-card border rounded-2xl shadow-lg z-50 lg:hidden"
    >
      <nav className="flex h-full items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center h-full w-full relative"
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <item.icon
                className={cn(
                  "h-6 w-6 transition-colors",
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              />
              {item.count && item.count > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute top-1 right-6 h-5 w-5 justify-center p-0"
                >
                  {item.count}
                </Badge>
              )}
            </motion.div>
            {isActive(item.href) && (
              <motion.div
                layoutId="customer-active-indicator"
                className="absolute bottom-1 h-1 w-6 rounded-full bg-primary"
              />
            )}
          </Link>
        ))}
      </nav>
    </motion.div>
  );
}
