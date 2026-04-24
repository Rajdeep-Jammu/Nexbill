'use client';

import PageHeader from '@/components/PageHeader';
import ProductSelector from '@/components/billing/ProductSelector';
import CurrentBill from '@/components/billing/CurrentBill';
import SessionLoader from '@/components/billing/SessionLoader';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function BillingPage() {
  const firestore = useFirestore();
  const shopId = useAuthStore(state => state.shopId);

  const productsQuery = useMemo(() => {
    if (!shopId) return null;
    return query(collection(firestore, 'shops', shopId, 'products'));
  }, [firestore, shopId]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Billing" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
             <Skeleton className="h-12 w-1/3" />
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pr-4">
                {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
             </div>
          </div>
          <div>
            <Skeleton className="h-[calc(80vh-100px)] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Billing" />
      <SessionLoader />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProductSelector products={products || []} />
        </div>
        <div>
          <CurrentBill />
        </div>
      </div>
    </div>
  );
}
