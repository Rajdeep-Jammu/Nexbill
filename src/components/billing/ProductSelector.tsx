"use client";

import Image from "next/image";
import type { Product } from "@/lib/types";
import { useBillingStore } from "@/hooks/use-billing-store";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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
     <motion.div whileHover={{ y: -3, scale: 1.01 }}>
      <Card
        className="overflow-hidden cursor-pointer transition-all hover:shadow-primary/20 bg-card/50 backdrop-blur-lg border-white/10 rounded-xl"
        onClick={handleAddToCart}
      >
        <CardContent className="p-2">
          <div className="flex items-center gap-3">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={50}
              height={50}
              className="rounded-lg object-cover aspect-square"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-xs sm:text-sm truncate">{product.name}</h3>
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
    </motion.div>
  );
};


export default function ProductSelector({ products }: { products: Product[] }) {
  return (
    <div>
      <h2 className="font-headline text-xl font-semibold mb-4">Available Products</h2>
      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pr-4">
          {products.map((product) => (
            <BillingProductCard key={product.id} product={product} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
