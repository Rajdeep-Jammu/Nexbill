"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

type ProductCardProps = {
  product: Product;
};

const getStockStatus = (quantity: number, threshold: number = 20) => {
  if (quantity > threshold) return "bg-green-500";
  if (quantity > 0) return "bg-yellow-500";
  return "bg-destructive";
};

export default function ProductCard({ product }: ProductCardProps) {
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
              width={300}
              height={300}
              className="aspect-square w-full object-cover"
              data-ai-hint={product.imageHint}
            />
            <div
              className={cn(
                "absolute top-2 right-2 h-3 w-3 rounded-full border-2 border-background",
                getStockStatus(product.quantity)
              )}
            />
          </div>
          <div className="p-3 flex flex-col flex-grow space-y-2">
            <h3 className="font-semibold text-sm truncate text-foreground flex-grow">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground">{`Qty: ${product.quantity}`}</p>
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-foreground">
                ₹{product.price.toLocaleString()}
              </p>
              <Badge variant="secondary" className="font-mono text-xs">{product.category}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
