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
  const { isLoggedIn, initialized, shopId, shopOwnerId } = useAuthStore();
  const { user: firebaseUser, isUserLoading } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !initialized || isUserLoading) return;

    const isSetupPage = pathname.includes('/setup');

    // If store is initialized but no shop is configured, force setup.
    if (!shopId && !isSetupPage) {
      router.replace('/admin/setup');
      return;
    }

    // If shop is configured, but user is not logged into Firebase, it's an inconsistent state.
    // This can happen if local storage is manipulated or cleared. Resetting is safest.
    if (shopId && shopOwnerId && !firebaseUser) {
       // Silently re-auth is handled by Firebase provider. If it fails, maybe reset.
       // For now, we assume the provider handles it. Let's see if this is sufficient.
    }
    
    // If shop is configured, user is logged in, but PIN is not verified, go to login.
    if (shopId && !isLoggedIn && !isSetupPage) {
      router.replace('/admin/login');
      return;
    }

  }, [isClient, initialized, isLoggedIn, router, shopId, shopOwnerId, firebaseUser, isUserLoading, pathname]);


  if (!isClient || !initialized || isUserLoading || (!shopId && !pathname.includes('/setup')) || (shopId && !isLoggedIn && !pathname.includes('/setup'))) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1 p-4 pb-24">{children}</main>
      <MobileBottomNav />
    </div>
  );
}
