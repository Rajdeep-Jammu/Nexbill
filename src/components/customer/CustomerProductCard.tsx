"use client";

import Image from "next/image";
import { Plus, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

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
  const [isAdding, setIsAdding] = useState(false);

  const cartItem = items.find((item) => item.id === product.id);
  const stock = product.quantity - (cartItem?.cartQuantity || 0);

  const handleAddToCart = () => {
    if (stock > 0) {
      setIsAdding(true);
      addToCart(product);
      setTimeout(() => setIsAdding(false), 500);
      toast({
        title: `${product.name} added`,
        description: "Added to cart!",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Sold Out",
        description: `${product.name} is gone!`,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="h-full"
    >
      <Card className="overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] h-full flex flex-col border-none bg-[#111827] shadow-xl hover:shadow-[0_20px_50px_rgba(99,102,241,0.2)] transition-all duration-300">
        <CardContent className="p-0 flex flex-col flex-grow">
          <div className="relative overflow-hidden aspect-[4/5] sm:aspect-[4/5]">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              data-ai-hint={product.imageHint}
              sizes="(max-width: 768px) 33vw, 25vw"
            />
            
            <div className="absolute top-2 left-2 flex flex-col gap-1 sm:top-4 sm:left-4 sm:gap-2">
              {stock <= 0 ? (
                <Badge variant="destructive" className="font-bold text-[8px] sm:text-xs uppercase px-1.5 py-0">Sold Out</Badge>
              ) : stock <= 5 ? (
                <Badge className="bg-orange-500 font-bold text-[8px] sm:text-xs uppercase px-1.5 py-0">Limited</Badge>
              ) : null}
            </div>

            {/* Hover overlay for desktop only */}
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center p-4">
               <Button 
                onClick={handleAddToCart} 
                disabled={stock <= 0}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-10 rounded-xl shadow-xl transform translate-y-4 hover:translate-y-0 transition-transform"
               >
                 {isAdding ? "Adding..." : "Quick Add"}
               </Button>
            </div>
          </div>

          <div className="p-2 sm:p-5 flex flex-col flex-grow bg-card/40 backdrop-blur-md">
            <h3 className="font-headline font-bold text-[10px] sm:text-base line-clamp-1 text-white/90">
              {product.name}
            </h3>
            
            <div className="flex items-center justify-between mt-auto pt-1 sm:pt-0">
              <div className="flex flex-col">
                 <p className="text-xs sm:text-2xl font-black text-primary">
                  ₹{product.price.toLocaleString()}
                </p>
                <p className="hidden sm:block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                  Price
                </p>
              </div>

              <motion.div whileTap={{ scale: 0.8 }}>
                <Button 
                  size="icon" 
                  onClick={handleAddToCart} 
                  disabled={stock <= 0} 
                  className="h-7 w-7 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl shadow-lg bg-white/5 border border-white/10 text-white hover:bg-primary hover:border-primary sm:hidden flex"
                >
                  <Plus className="h-4 w-4 sm:h-6 sm:w-6" />
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}