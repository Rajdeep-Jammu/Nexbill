'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  ShoppingCart,
  LayoutDashboard,
  Search,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import { useBillingStore } from '@/hooks/use-billing-store';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { ProfileDropdown } from './ProfileDropdown';
import { Input } from '../ui/input';

const navItems = [
  { href: '/profile', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/shop', label: 'Browse Products', icon: ShoppingBag },
];

export function CustomerHeader() {
  const pathname = usePathname();
  const { totalItems } = useBillingStore();
  const { user, isUserLoading } = useUser();
  const cartItemCount = totalItems();
  
  return (
    <header className="hidden lg:flex items-center justify-between px-8 h-20 border-b border-border/50 sticky top-0 bg-background/60 backdrop-blur-2xl z-40 transition-all duration-300">
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
            <Logo className="h-7 w-7" />
          </div>
          <span className="font-headline text-2xl font-black tracking-tighter">NexBill</span>
        </Link>
        
        <nav className="flex items-center gap-8">
          {user && navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 text-sm font-black transition-all hover:text-primary relative group',
                 pathname === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {pathname === item.href && (
                <div className="absolute -bottom-7 left-0 right-0 h-1 bg-primary rounded-full" />
              )}
            </Link>
          ))}
          {!user && (
             <Link
              href="/shop"
              className={cn(
                'flex items-center gap-2 text-sm font-black transition-all hover:text-primary',
                 pathname === '/shop' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <ShoppingBag className="h-4 w-4" />
              Shop Now
            </Link>
          )}
        </nav>
      </div>

      <div className="flex-1 max-w-md px-10">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input 
            placeholder="Search collections..." 
            className="pl-10 h-11 rounded-2xl bg-secondary/50 border-none focus-visible:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10">
                <Bell className="h-5 w-5" />
            </Button>
            <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary rounded-full transition-all group">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 font-black border-2 border-background animate-in fade-in zoom-in"
                    >
                        {cartItemCount}
                    </Badge>
                    )}
                </Button>
            </Link>
        </div>

        <div className="h-8 w-px bg-border/50" />

        {isUserLoading ? (
            <div className='w-10 h-10 animate-pulse bg-muted rounded-full' />
        ) : user ? (
            <ProfileDropdown />
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="font-bold rounded-xl px-6 h-11 transition-all hover:bg-primary/5">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="font-black rounded-xl px-8 h-11 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  Join NexBill
                </Button>
              </Link>
            </div>
          )}
      </div>
    </header>
  );
}
