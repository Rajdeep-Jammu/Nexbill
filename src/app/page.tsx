'use client';

import CustomerLayout from './customer-layout';
import PageHeader from '@/components/PageHeader';
import ProductGrid from '@/components/customer/ProductGrid';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomerHomePage() {
  const firestore = useFirestore();

  // 1. Fetch the public config to get the active shop ID
  const configRef = useMemoFirebase(() => doc(firestore, 'public', 'config'), [firestore]);
  const { data: config, isLoading: isConfigLoading } = useDoc(configRef);
  const shopId = (config as any)?.activeShopId;

  // 2. Fetch products for that shop ID
  const productsQuery = useMemoFirebase(() => {
    if (!shopId) return null;
    return query(collection(firestore, 'shops', shopId, 'products'));
  }, [firestore, shopId]);

  const { data: products, isLoading: areProductsLoading } = useCollection<Product>(productsQuery);

  const isLoading = isConfigLoading || areProductsLoading;

  return (
    <CustomerLayout>
      <PageHeader title={(config as any)?.shopName || 'Our Products'} />
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : (
        <ProductGrid products={products || []} />
      )}
    </CustomerLayout>
  );
}
