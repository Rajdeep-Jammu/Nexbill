'use client';

import { Loader2, ShoppingBag, Sparkles, Filter } from 'lucide-react';
import CustomerLayout from '../customer-layout';
import PageHeader from '@/components/PageHeader';
import ProductGrid from '@/components/customer/ProductGrid';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
      <div className="flex flex-col gap-10 pb-20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.3em]"
            >
              <Sparkles className="h-3 w-3" />
              Curated Collection
            </motion.div>
            <PageHeader title={(config as any)?.shopName || 'Premium Store'} />
            <p className="text-muted-foreground font-bold -mt-4 text-sm sm:text-lg max-w-xl">
              Discover the latest high-end products curated specifically for our community.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold border-border/50 bg-background/50 backdrop-blur-md hidden sm:flex">
                <Filter className="mr-2 h-4 w-4" />
                Refine
             </Button>
             {user ? (
                <Link href="/profile">
                  <Button className="rounded-2xl h-12 px-8 font-black shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-105">
                    My Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                   <Button className="rounded-2xl h-12 px-8 font-black shadow-xl shadow-primary/20">
                    Sign In to Shop
                   </Button>
                </Link>
              )}
          </div>
        </div>

        {isDataLoading ? (
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-[2rem] sm:rounded-[3rem]" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-secondary/10 rounded-[4rem] border-4 border-dashed border-border/50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="bg-primary/10 p-10 rounded-full mb-8">
                <ShoppingBag className="h-16 w-16 text-primary opacity-30" />
              </div>
            </motion.div>
            <h2 className="text-3xl font-black mb-2 tracking-tight">The shelf is currently bare</h2>
            <p className="text-muted-foreground max-w-sm font-bold text-lg">
              We're currently updating our catalog with new premium arrivals. Check back soon!
            </p>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}