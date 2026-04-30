'use client';

import CustomerProductCard from './CustomerProductCard';
import type { Product } from '@/lib/types';

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-6">
      {products.map(product => (
        <CustomerProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
