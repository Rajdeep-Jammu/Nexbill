'use client';

import { Loader2, ShoppingBag } from 'lucide-react';
import CustomerLayout from '../customer-layout';
import PageHeader from '@/components/PageHeader';
import ProductGrid from '@/components/customer/ProductGrid';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ShopPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

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

  const isDataLoading = isConfigLoading || areProductsLoading;

  if (isUserLoading) {
    return (
       <CustomerLayout>
        <div className="flex h-[60vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <PageHeader title={(config as any)?.shopName || 'Our Products'} />
        {user && (
          <Link href="/profile">
            <Button variant="outline" className="rounded-full px-6">
              Go to My Dashboard
            </Button>
          </Link>
        )}
      </div>

      {isDataLoading ? (
        <div className="grid grid-cols-3 gap-4 md:gap-6">
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <ShoppingBag className="h-12 w-12 text-primary opacity-50" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No products found</h2>
          <p className="text-muted-foreground max-w-sm">
            The shop is currently empty. Please check back later!
          </p>
        </div>
      )}
    </CustomerLayout>
  );
}
