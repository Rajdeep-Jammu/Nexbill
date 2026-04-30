'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Settings,
  ShieldCheck,
  LogOut,
  Moon,
  Sun,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser, useAuth } from '@/firebase';
import { useThemeStore } from '@/hooks/use-theme-store';
import { useToast } from '@/hooks/use-toast';

export function ProfileDropdown() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAdmin } = useUser();
  const auth = useAuth();
  const { theme, toggleTheme } = useThemeStore();

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

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-primary/20 p-0 hover:border-primary/50 transition-all shadow-lg group">
          <Avatar className="h-full w-full">
            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
            <AvatarFallback className="font-black bg-primary/10 text-primary">
              {user.displayName ? user.displayName[0].toUpperCase() : (user.email?.[0].toUpperCase() || 'U')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 mt-2 rounded-[1.5rem] p-2 border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-2" align="end">
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
            <LayoutDashboard className="h-4 w-4 text-primary" />
            My Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer">
          <Link href="/settings" className="flex items-center gap-3 font-bold">
            <Settings className="h-4 w-4 text-indigo-500" />
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
  );
}
