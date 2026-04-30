
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="h-full group"
    >
      <Card className="overflow-hidden rounded-[2rem] h-full flex flex-col border-none bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-0 flex flex-col flex-grow">
          <div className="relative overflow-hidden aspect-[4/5]">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              data-ai-hint={product.imageHint}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {stock <= 0 && (
                <Badge variant="destructive" className="font-bold shadow-lg">Sold Out</Badge>
              )}
              {stock > 0 && stock <= 10 && (
                <Badge className="bg-orange-500 hover:bg-orange-600 font-bold shadow-lg">Low Stock</Badge>
              )}
              <Badge variant="secondary" className="bg-white/80 backdrop-blur-md text-xs font-bold shadow-sm">
                {product.category}
              </Badge>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
               <Button 
                onClick={handleAddToCart} 
                disabled={stock <= 0}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-2xl shadow-xl"
               >
                 {isAdding ? "Adding..." : "Add to Cart"}
               </Button>
            </div>
          </div>

          <div className="p-5 space-y-3 flex flex-col flex-grow bg-white">
            <h3 className="font-headline font-bold text-base md:text-lg line-clamp-1 text-gray-800">
              {product.name}
            </h3>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex flex-col">
                 <p className="text-xl md:text-2xl font-black text-primary">
                  ₹{product.price.toLocaleString()}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                  Price per unit
                </p>
              </div>

              <motion.div whileTap={{ scale: 0.8 }}>
                <Button 
                  size="icon" 
                  onClick={handleAddToCart} 
                  disabled={stock <= 0} 
                  className="h-12 w-12 rounded-2xl shadow-lg bg-gray-50 text-gray-900 hover:bg-primary hover:text-white lg:hidden"
                >
                  <AnimatePresence mode="wait">
                    {isAdding ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <Plus className="h-6 w-6" />
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
