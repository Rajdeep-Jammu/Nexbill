"use client";

import Image from "next/image";
import type { Product } from "@/lib/types";
import { useBillingStore } from "@/hooks/use-billing-store";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const BillingProductCard = ({ product }: { product: Product }) => {
  const addToCart = useBillingStore((state) => state.addToCart);
  const items = useBillingStore((state) => state.items);
  const { toast } = useToast();

  const cartItem = items.find(item => item.id === product.id);
  const stock = product.quantity - (cartItem?.cartQuantity || 0);

  const handleAddToCart = () => {
    if (stock > 0) {
      addToCart(product);
      toast({
        title: `${product.name} added`,
        description: "Added to the current bill.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: `${product.name} is out of stock.`,
      });
    }
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all hover:shadow-primary/20"
      onClick={handleAddToCart}
    >
      <CardContent className="p-2">
        <div className="flex items-center gap-3">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={60}
            height={60}
            className="rounded-md object-cover aspect-square"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-sm truncate">{product.name}</h3>
            <p className="text-xs text-muted-foreground">
              Stock: {stock}
            </p>
            <p className="text-sm font-bold mt-1">
              ₹{product.price.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


export default function ProductSelector({ products }: { products: Product[] }) {
  return (
    <div>
      <h2 className="font-headline text-xl font-semibold mb-4">Available Products</h2>
      <ScrollArea className="h-[65vh]">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 pr-4">
          {products.map((product) => (
            <BillingProductCard key={product.id} product={product} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
