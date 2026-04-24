'use client';

import PageHeader from '@/components/PageHeader';
import ProductGrid from '@/components/inventory/ProductGrid';
import AddProductDialog from '@/components/inventory/AddProductDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useAuthStore } from '@/hooks/use-auth-store';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/lib/types';

export default function InventoryPage() {
  const firestore = useFirestore();
  const shopId = useAuthStore(state => state.shopId);

  const productsQuery = useMemoFirebase(() => {
    if (!shopId) return null;
    return query(collection(firestore, 'shops', shopId, 'products'));
  }, [firestore, shopId]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  return (
    <div>
      <PageHeader title="Inventory">
        <AddProductDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </AddProductDialog>
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : (
        <ProductGrid products={products || []} />
      )}
    </div>
  );
}
