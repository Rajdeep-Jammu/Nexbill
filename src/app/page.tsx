
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import CustomerLayout from './customer-layout';

/**
 * Root Router Page
 * Redirects logged-in users to their Dashboard (/profile) 
 * and guests to the product Shop (/shop).
 */
export default function CustomerHomePage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        router.replace('/profile');
      } else {
        router.replace('/shop');
      }
    }
  }, [user, isUserLoading, router]);

  return (
    <CustomerLayout>
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </CustomerLayout>
  );
}
