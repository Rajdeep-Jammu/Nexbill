"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="h-full"
    >
      <Card className="overflow-hidden rounded-2xl h-full flex flex-col border bg-card shadow-md">
        <CardContent className="p-0 flex flex-col flex-grow">
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
              <Badge variant="destructive" className="absolute top-3 left-3">Out of Stock</Badge>
            )}
             {stock > 0 && stock <= 10 && (
                <Badge variant="secondary" className="absolute top-3 left-3 bg-yellow-500 text-black">Low Stock</Badge>
            )}
          </div>
          <div className="p-4 space-y-3 flex flex-col flex-grow">
            <h3 className="font-semibold text-sm md:text-base truncate text-foreground flex-grow">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-base md:text-lg font-bold text-foreground">
                ₹{product.price.toLocaleString()}
              </p>
              <Button size="icon" onClick={handleAddToCart} disabled={stock <= 0} className="h-8 w-8 md:h-9 md:w-9 shrink-0">
                <Plus className="h-4 md:h-5 w-4 md:w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
