'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  ShoppingCart,
  Settings,
  LogIn,
  UserPlus,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import { useBillingStore } from '@/hooks/use-billing-store';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { ThemeToggle } from '@/components/ThemeToggle';

const navItems = [
  { href: '/profile', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/shop', label: 'Products', icon: ShoppingBag },
];

export function CustomerHeader() {
  const pathname = usePathname();
  const { totalItems } = useBillingStore();
  const { user, isUserLoading } = useUser();
  const cartItemCount = totalItems();
  
  const homeHref = '/';

  return (
    <header className="hidden lg:flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-40">
      <div className="flex items-center gap-6">
        <Link href={homeHref} className="flex items-center gap-2">
          <Logo className="h-7 w-7 text-primary" />
          <span className="font-headline text-xl font-bold">NexBill</span>
        </Link>
        <nav className="flex items-center gap-4">
          {user && navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                 pathname === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {!user && (
             <Link
              href="/shop"
              className={cn(
                'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                 pathname === '/shop' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <ShoppingBag className="h-4 w-4" />
              Products
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart />
            {cartItemCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0"
              >
                {cartItemCount}
              </Badge>
            )}
            <span className="sr-only">Cart</span>
          </Button>
        </Link>

        {isUserLoading ? (
            <div className='w-20 h-10 animate-pulse bg-muted rounded-md' />
        ) : user ? (
            <>
              <Link href="/settings">
                <Button variant="ghost" size="icon">
                  <Settings />
                  <span className="sr-only">Settings</span>
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="mr-2" />
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button>
                  <UserPlus className="mr-2" />
                  Sign Up
                </Button>
              </Link>
            </>
          )}
      </div>
    </header>
  );
}