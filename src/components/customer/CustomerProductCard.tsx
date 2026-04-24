"use client";

import Image from "next/image";
import { Plus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBillingStore } from "@/hooks/use-billing-store";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

type CustomerProductCardProps = {
  product: Product;
};

export default function CustomerProductCard({ product }: CustomerProductCardProps) {
  const addToCart = useBillingStore((state) => state.addToCart);
  const items = useBillingStore((state) => state.items);
  const { toast } = useToast();

  const cartItem = items.find((item) => item.id === product.id);
  const stock = product.quantity - (cartItem?.cartQuantity || 0);

  const handleAddToCart = () => {
    if (stock > 0) {
      addToCart(product);
      toast({
        title: `${product.name} added`,
        description: "Item added to your cart.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
      });
    }
  };

  return (
    <Card className="overflow-hidden rounded-xl border-border bg-card/50 shadow-md">
      <CardContent className="p-0">
        <div className="relative">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={400}
            height={400}
            className="aspect-square w-full object-cover"
            data-ai-hint={product.imageHint}
          />
          {stock <= 0 && (
            <Badge variant="destructive" className="absolute top-2 left-2">Out of Stock</Badge>
          )}
        </div>
        <div className="p-3 space-y-2">
          <h3 className="font-semibold text-sm truncate text-foreground">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-foreground">
              ₹{product.price.toLocaleString()}
            </p>
            <Button size="icon" onClick={handleAddToCart} disabled={stock <= 0} className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
