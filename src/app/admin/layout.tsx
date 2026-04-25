'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/use-auth-store';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';

export default function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, shopId } = useAuthStore();
  const { isUserLoading } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isUserLoading) return;

    const isSetupPage = pathname.includes('/admin/setup');
    const isLoginPage = pathname.includes('/admin/login');

    // If store is hydrated but no shop is configured, force setup.
    if (!shopId && !isSetupPage) {
      router.replace('/admin/setup');
      return;
    }
    
    // If shop is configured, but PIN is not verified, go to login.
    // Do not redirect if we are already on the setup or login page.
    if (shopId && !isLoggedIn && !isSetupPage && !isLoginPage) {
      router.replace('/admin/login');
      return;
    }

  }, [isClient, isLoggedIn, router, shopId, isUserLoading, pathname]);

  const isAuthPage = pathname.includes('/admin/setup') || pathname.includes('/admin/login');

  // While initializing, or if redirection is needed for a non-auth page, show a loader.
  if (
    (!isClient || isUserLoading) ||
    (!isAuthPage && (!shopId || !isLoggedIn))
  ) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // For auth pages, render them directly without the main layout wrapper.
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  // For authenticated admin pages, render with the main mobile navigation.
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1 p-4 pb-24">{children}</main>
      <MobileBottomNav />
    </div>
  );
}
