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

const getStockStatus = (quantity: number) => {
  if (quantity > 20) return "bg-green-500";
  if (quantity > 0) return "bg-yellow-500";
  return "bg-red-500";
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="overflow-hidden rounded-xl border-border bg-card/50 shadow-md transition-all hover:shadow-primary/20">
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
            <div
              className={cn(
                "absolute top-2 right-2 h-2.5 w-2.5 rounded-full border border-background",
                getStockStatus(product.quantity)
              )}
            />
          </div>
          <div className="p-3">
            <h3 className="font-semibold text-sm truncate text-foreground">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground">{`Qty: ${product.quantity}`}</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-base font-bold text-foreground">
                ₹{product.price.toLocaleString()}
              </p>
              <Badge variant="secondary" className="font-mono text-xs px-1.5 py-0.5">{product.category}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
