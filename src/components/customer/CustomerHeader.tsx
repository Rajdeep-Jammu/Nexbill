"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, ShoppingCart, User as ProfileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { useBillingStore } from "@/hooks/use-billing-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: ShoppingBag, label: "Products" },
];

export function CustomerHeader() {
  const pathname = usePathname();
  const { totalItems } = useBillingStore();
  const cartItemCount = totalItems();

  return (
    <header className="hidden lg:flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-40">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-7 w-7 text-primary" />
          <span className="font-headline text-xl font-bold">Momentum</span>
        </Link>
        <nav className="flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
         <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart />
                {cartItemCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{cartItemCount}</Badge>
                )}
                <span className="sr-only">Cart</span>
            </Button>
        </Link>
        <Link href="/profile">
            <Button variant="ghost" size="icon">
                <ProfileIcon />
                <span className="sr-only">Profile</span>
            </Button>
        </Link>
        <Link href="/admin/login">
          <Button variant="outline" size="sm">Admin Panel</Button>
        </Link>
      </div>
    </header>
  );
}
