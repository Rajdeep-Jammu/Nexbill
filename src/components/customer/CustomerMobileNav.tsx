"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  ShoppingCart,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { useBillingStore } from "@/hooks/use-billing-store";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

export default function CustomerMobileNav() {
  const pathname = usePathname();
  const { totalItems } = useBillingStore();
  const cartItemCount = totalItems();
  
  const navItems = [
    { href: "/", icon: ShoppingBag, label: "Products" },
    { href: "/cart", icon: ShoppingCart, label: "Cart", count: cartItemCount },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="fixed bottom-4 left-4 right-4 h-16 bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 lg:hidden"
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
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              />
               {item.count && item.count > 0 && (
                 <Badge variant="destructive" className="absolute top-1 right-6 h-5 w-5 justify-center p-0">{item.count}</Badge>
               )}
            </motion.div>
            {pathname === item.href && (
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
