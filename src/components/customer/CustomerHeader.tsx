"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, ShoppingCart, User as ProfileIcon, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { useBillingStore } from "@/hooks/use-billing-store";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";

const navItems = [
  { href: "/", icon: ShoppingBag, label: "Products" },
];

export function CustomerHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useBillingStore();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const cartItemCount = totalItems();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  }

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

      <div className="flex items-center gap-2">
         <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart />
                {cartItemCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{cartItemCount}</Badge>
                )}
                <span className="sr-only">Cart</span>
            </Button>
        </Link>
        
        {!isUserLoading && (
          user ? (
            <>
              <Link href="/profile">
                  <Button variant="ghost" size="icon">
                      <ProfileIcon />
                      <span className="sr-only">Profile</span>
                  </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
               <Link href="/login">
                  <Button variant="ghost" size="sm"><LogIn className="mr-2"/>Login</Button>
              </Link>
              <Link href="/signup">
                  <Button variant="outline" size="sm"><UserPlus className="mr-2"/>Sign Up</Button>
              </Link>
            </>
          )
        )}
        
        <Link href="/admin/login">
          <Button size="sm">Admin Panel</Button>
        </Link>
      </div>
    </header>
  );
}
