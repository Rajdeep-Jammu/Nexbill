'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/use-auth-store';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import DesktopSidebar from '@/components/layout/DesktopSidebar';
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
  const { shopId, loadShopContext } = useAuthStore();
  const { user, isUserLoading, isAdmin } = useUser();
  const firestore = useFirestore();
  const [isClient, setIsClient] = useState(false);
  const [isContextLoading, setIsContextLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isUserLoading) return;

    // 1. If not an admin, they have no business here.
    if (!isAdmin) {
      router.replace('/login');
      return;
    }

    const isSetupPage = pathname.includes('/admin/setup');
    
    // 2. For admins without local shop context, try to load it from the public config.
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
                return;
              }
            }
          }
          router.replace('/admin/setup');
        } catch (error) {
          console.error("Error fetching shop context for admin:", error);
          router.replace('/admin/setup');
        } finally {
          setIsContextLoading(false);
        }
      };
      
      fetchShopContext();
      return;
    }

    // 3. If no shop is configured even for admin, force setup.
    if (!shopId && !isSetupPage) {
      router.replace('/admin/setup');
      return;
    }

  }, [isClient, router, shopId, isUserLoading, pathname, isAdmin, firestore, loadShopContext]);

  const isAuthPage = pathname.includes('/admin/setup');

  if (
    (!isClient || isUserLoading || isContextLoading) ||
    (!isAuthPage && !isAdmin)
  ) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthPage) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DesktopSidebar />
      <main className="flex-1 p-4 pb-24 lg:pb-8 lg:p-8 lg:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
