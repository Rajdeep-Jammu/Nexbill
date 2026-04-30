'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  ShoppingCart,
  Settings,
  LogIn,
  UserPlus,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  User,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import { useBillingStore } from '@/hooks/use-billing-store';
import { cn } from '@/lib/utils';
import { useUser, useAuth } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useThemeStore } from '@/hooks/use-theme-store';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { href: '/profile', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/shop', label: 'Products', icon: ShoppingBag },
];

export function CustomerHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { totalItems } = useBillingStore();
  const { user, isUserLoading, isAdmin } = useUser();
  const auth = useAuth();
  const { theme, toggleTheme } = useThemeStore();
  const cartItemCount = totalItems();
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({
        title: 'Logged Out',
        description: 'See you soon!',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: error.message,
      });
    }
  };

  return (
    <header className="hidden lg:flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-2xl z-40">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
          <span className="font-headline text-xl font-black tracking-tight">NexBill</span>
        </Link>
        <nav className="flex items-center gap-6">
          {user && navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 text-sm font-bold transition-all hover:text-primary',
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
                'flex items-center gap-2 text-sm font-bold transition-all hover:text-primary',
                 pathname === '/shop' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <ShoppingBag className="h-4 w-4" />
              Shop
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary rounded-full transition-all">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 font-black border-2 border-background animate-in fade-in zoom-in"
              >
                {cartItemCount}
              </Badge>
            )}
            <span className="sr-only">Cart</span>
          </Button>
        </Link>

        {isUserLoading ? (
            <div className='w-10 h-10 animate-pulse bg-muted rounded-full' />
        ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-primary/20 p-0 hover:border-primary/50 transition-all">
                  <Avatar className="h-full w-full">
                    {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                    <AvatarFallback className="font-black bg-primary/10 text-primary">
                      {user.displayName ? user.displayName[0].toUpperCase() : (user.email?.[0].toUpperCase() || 'U')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mt-2 rounded-2xl p-2 border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-2" align="end">
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-black leading-none">{user.displayName || 'Guest User'}</p>
                    <p className="text-xs font-bold leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                
                <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer">
                  <Link href="/profile" className="flex items-center gap-3 font-bold">
                    <LayoutDashboard className="h-4 w-4" />
                    My Dashboard
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer">
                  <Link href="/settings" className="flex items-center gap-3 font-bold">
                    <Settings className="h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>

                {isAdmin && (
                  <>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem asChild className="rounded-xl p-3 bg-primary/5 text-primary focus:bg-primary/20 focus:text-primary transition-all cursor-pointer">
                      <Link href="/admin/dashboard" className="flex items-center gap-3 font-black">
                        <ShieldCheck className="h-4 w-4" />
                        Shop Owner Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator className="bg-border/50" />
                
                <DropdownMenuItem onClick={toggleTheme} className="rounded-xl p-3 focus:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 font-bold">
                    {theme === 'light' ? (
                      <>
                        <Moon className="h-4 w-4 text-indigo-600" />
                        <span>Switch to Dark</span>
                      </>
                    ) : (
                      <>
                        <Sun className="h-4 w-4 text-amber-400" />
                        <span>Switch to Light</span>
                      </>
                    )}
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border/50" />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="rounded-xl p-3 text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 font-black">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-bold rounded-full px-6">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="font-black rounded-full px-6 shadow-lg shadow-primary/20">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
      </div>
    </header>
  );
}