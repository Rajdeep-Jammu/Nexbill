'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/use-auth-store';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Loader2 } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, shopId, loadShopContext } = useAuthStore();
  const { user, isUserLoading, isAdmin } = useUser();
  const firestore = useFirestore();
  const [isClient, setIsClient] = useState(false);
  const [isContextLoading, setIsContextLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isUserLoading) return;

    const isSetupPage = pathname.includes('/admin/setup');
    const isLoginPage = pathname.includes('/admin/login');
    
    // For admins without local shop context, try to load it from the public config.
    if (isAdmin && !shopId && !isSetupPage) {
      const fetchShopContext = async () => {
        setIsContextLoading(true);
        try {
          const configRef = doc(firestore, 'public', 'config');
          const configSnap = await getDoc(configRef);
          
          if (configSnap.exists()) {
            const activeShopId = configSnap.data().activeShopId;
            if (activeShopId) {
              const shopRef = doc(firestore, 'shops', activeShopId);
              const shopSnap = await getDoc(shopRef);
              if (shopSnap.exists()) {
                const { id, name, shopOwnerId } = shopSnap.data();
                loadShopContext({ shopId: id, shopName: name, shopOwnerId });
                // Context loaded. Subsequent useEffect checks will handle routing.
                return;
              }
            }
          }
          // If context can't be loaded for any reason, redirect to setup.
          router.replace('/admin/setup');
        } catch (error) {
          console.error("Error fetching shop context for admin:", error);
          router.replace('/admin/setup'); // Fallback on error
        } finally {
          setIsContextLoading(false);
        }
      };
      
      fetchShopContext();
      return; // Wait for context loading to complete.
    }


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

  }, [isClient, isLoggedIn, router, shopId, isUserLoading, pathname, isAdmin, firestore, loadShopContext]);

  const isAuthPage = pathname.includes('/admin/setup') || pathname.includes('/admin/login');

  // While initializing, or if redirection is needed for a non-auth page, show a loader.
  if (
    (!isClient || isUserLoading || isContextLoading) ||
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
