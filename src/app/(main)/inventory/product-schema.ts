import { z } from "zod";

export const productSchema = z.object({
  productName: z.string().min(3, "Product name must be at least 3 characters"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  quantity: z.coerce.number().int().min(0, "Quantity must be a positive integer"),
  category: z.string().min(3, "Category is required"),
  features: z.string().optional(),
  description: z.string().optional(),
});

export type Product = z.infer<typeof productSchema>;
